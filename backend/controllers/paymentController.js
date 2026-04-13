const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Task = require('../models/Task');
const Transaction = require('../models/Transaction');
const Worker = require('../models/Worker');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLATFORM_COMMISSION_PERCENT = 10;

const createOrder = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    console.log('Creating payment order for job:', jobId);
    if (!jobId) {
      res.status(400);
      return next(new Error('Job ID is required'));
    }

    const task = await Task.findById(jobId).populate('postedBy assignedTo');
    if (!task) {
      console.log('Task not found for ID:', jobId);
      res.status(404);
      return next(new Error('Job not found'));
    }
    console.log('Found task:', task.title, 'Status:', task.status);

    if (!task.assignedTo) {
      res.status(400);
      return next(new Error('This job has no worker assigned'));
    }

    if (task.postedBy._id.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Only the job provider can make payment'));
    }

    if (task.status !== 'in-progress') {
      res.status(400);
      return next(new Error('Job must be in progress to make payment'));
    }

    const existingPayment = await Payment.findOne({ job: jobId, status: { $in: ['held', 'released'] } });
    if (existingPayment) {
      res.status(400);
      return next(new Error('Payment already made for this job'));
    }

    const amount = task.budget?.amount || 0;
    if (amount <= 0) {
      res.status(400);
      return next(new Error('Invalid job amount'));
    }

    const platformCommission = Math.round((amount * PLATFORM_COMMISSION_PERCENT) / 100);
    const workerAmount = amount - platformCommission;

    const options = {
      amount: Math.round(amount * 100), // Ensure it's an integer
      currency: 'INR',
      receipt: `rcpt_${jobId.slice(-8)}_${Date.now()}`,
      notes: {
        jobId: jobId,
        providerId: req.user._id.toString(),
        workerId: task.assignedTo._id.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    let payment = await Payment.findOne({ job: jobId, status: 'pending' });
    
    if (payment) {
      payment.razorpayOrderId = order.id;
      payment.amount = amount;
      payment.platformCommission = platformCommission;
      payment.workerAmount = workerAmount;
      await payment.save();
    } else {
      payment = await Payment.create({
        job: jobId,
        provider: req.user._id,
        worker: task.assignedTo._id,
        amount: amount,
        platformCommission: platformCommission,
        workerAmount: workerAmount,
        status: 'pending',
        razorpayOrderId: order.id,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        razorpayOrderId: order.id,
        amount: Math.round(amount * 100),
        currency: 'INR',
        payment: payment,
      },
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400);
      return next(new Error('Missing payment verification details'));
    }

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      res.status(404);
      return next(new Error('Payment record not found'));
    }

    if (payment.provider.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Unauthorized'));
    }

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpaySignature;

    if (!isAuthentic) {
      payment.status = 'failed';
      await payment.save();
      res.status(400);
      return next(new Error('Payment verification failed'));
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'held';
    await payment.save();

    // Create a transaction record for the platform receiving money
    await Transaction.create({
      job: payment.job,
      provider: payment.provider,
      worker: payment.worker,
      amount: payment.amount,
      status: 'on-hold',
      paymentMethod: 'razorpay',
      transactionId: razorpayPaymentId,
      notes: 'Payment held in escrow',
    });

    res.json({
      success: true,
      message: 'Payment verified and held in escrow',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

const markJobCompleted = async (req, res, next) => {
  try {
    const jobId = req.params.jobId || req.body.jobId;

    if (!jobId) {
      res.status(400);
      return next(new Error('Job ID is required'));
    }

    const task = await Task.findById(jobId);
    if (!task) {
      res.status(404);
      return next(new Error('Job not found'));
    }

    const payment = await Payment.findOne({ job: jobId });
    if (!payment) {
      res.status(404);
      return next(new Error('Payment not found for this job'));
    }

    if (payment.status !== 'held') {
      res.status(400);
      return next(new Error('Payment must be in held status'));
    }

    const userId = req.user._id.toString();
    const isProvider = task.postedBy.toString() === userId;
    const isWorker = task.assignedTo && task.assignedTo.toString() === userId;

    if (!isProvider && !isWorker) {
      res.status(403);
      return next(new Error('Only provider or worker can mark job as completed'));
    }

    if (isProvider) {
      payment.providerConfirmed = true;
    }
    if (isWorker) {
      payment.workerConfirmed = true;
    }

    await payment.save();

    if (payment.providerConfirmed && payment.workerConfirmed) {
      job.status = 'completed';
      await job.save();
    }

    res.json({
      success: true,
      message: 'Job completion confirmed',
      data: {
        payment,
        bothConfirmed: payment.providerConfirmed && payment.workerConfirmed,
      },
    });
  } catch (error) {
    next(error);
  }
};

const releasePayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { notes } = req.body;

    if (req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Only admin can release payments'));
    }

    const payment = await Payment.findById(paymentId).populate('worker job');
    if (!payment) {
      res.status(404);
      return next(new Error('Payment not found'));
    }

    if (payment.status !== 'held') {
      res.status(400);
      return next(new Error('Payment must be in held status'));
    }

    if (!payment.providerConfirmed || !payment.workerConfirmed) {
      res.status(400);
      return next(new Error('Both provider and worker must confirm completion'));
    }

    // Perform Razorpay Transfer to Worker
    const workerProfile = await Worker.findOne({ user: payment.worker._id });
    if (!workerProfile || !workerProfile.razorpayAccountId) {
      res.status(400);
      return next(new Error('Worker does not have a Razorpay Account ID set up'));
    }

    try {
      const transfer = await razorpay.transfers.create({
        account: workerProfile.razorpayAccountId,
        amount: Math.round(payment.workerAmount * 100), // convert to paise
        currency: 'INR',
        notes: {
          paymentId: payment._id.toString(),
          jobId: payment.job._id.toString(),
        },
      });
      payment.razorpayTransferId = transfer.id;
    } catch (razorpayError) {
      console.error('Razorpay Transfer Failed:', razorpayError);
      res.status(500);
      return next(new Error(`Razorpay transfer failed: ${razorpayError.message}`));
    }

    payment.status = 'released';
    payment.releasedAt = new Date();
    payment.releasedBy = req.user._id;
    payment.notes = notes || '';
    await payment.save();

    // Update the transaction record
    await Transaction.findOneAndUpdate(
      { transactionId: payment.razorpayPaymentId },
      { 
        status: 'released',
        releasedAt: new Date(),
        notes: `Payment released. Worker: ${payment.workerAmount}, Platform: ${payment.platformCommission}`
      }
    );

    // Create specific transaction records for clarity if needed, 
    // but the above update to the main transaction is often sufficient for the owner's view.

    res.json({
      success: true,
      message: 'Payment released to worker via Razorpay Transfer',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentsByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const payments = await Payment.find({ job: jobId })
      .populate('provider', 'name email')
      .populate('worker', 'name email')
      .populate('job', 'title');

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  markJobCompleted,
  releasePayment,
  getPaymentsByJob,
};
