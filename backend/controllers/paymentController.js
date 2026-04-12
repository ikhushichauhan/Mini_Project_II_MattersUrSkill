const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Job = require('../models/Job');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLATFORM_COMMISSION_PERCENT = 10;

const createOrder = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      res.status(400);
      return next(new Error('Job ID is required'));
    }

    const job = await Job.findById(jobId).populate('provider worker');
    if (!job) {
      res.status(404);
      return next(new Error('Job not found'));
    }

    if (job.provider._id.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error('Only the job provider can make payment'));
    }

    if (job.status !== 'in-progress') {
      res.status(400);
      return next(new Error('Job must be in progress to make payment'));
    }

    const existingPayment = await Payment.findOne({ job: jobId, status: { $in: ['held', 'released'] } });
    if (existingPayment) {
      res.status(400);
      return next(new Error('Payment already made for this job'));
    }

    const amount = job.budget?.amount || 0;
    if (amount <= 0) {
      res.status(400);
      return next(new Error('Invalid job amount'));
    }

    const platformCommission = Math.round((amount * PLATFORM_COMMISSION_PERCENT) / 100);
    const workerAmount = amount - platformCommission;

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `job_${jobId}_${Date.now()}`,
      notes: {
        jobId: jobId,
        providerId: req.user._id.toString(),
        workerId: job.worker._id.toString(),
      },
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      job: jobId,
      provider: req.user._id,
      worker: job.worker._id,
      amount: amount,
      platformCommission: platformCommission,
      workerAmount: workerAmount,
      status: 'pending',
      razorpayOrderId: order.id,
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: amount,
        currency: 'INR',
        payment: payment,
      },
    });
  } catch (error) {
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
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
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
    const isProvider = job.provider.toString() === userId;
    const isWorker = job.worker.toString() === userId;

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

    payment.status = 'released';
    payment.releasedAt = new Date();
    payment.releasedBy = req.user._id;
    payment.notes = notes || '';
    await payment.save();

    res.json({
      success: true,
      message: 'Payment released to worker',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentsByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const payment = await Payment.findOne({ job: jobId })
      .populate('provider', 'name email')
      .populate('worker', 'name email')
      .populate('job', 'title');

    if (!payment) {
      res.status(404);
      return next(new Error('No payment found for this job'));
    }

    res.json({
      success: true,
      data: payment,
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
