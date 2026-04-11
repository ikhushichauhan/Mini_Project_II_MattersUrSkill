const User = require('../models/User');
const Worker = require('../models/Worker');
const Provider = require('../models/Provider');
const Job = require('../models/Job');
const Transaction = require('../models/Transaction');
const Review = require('../models/Review');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');

const createAuditLog = async (adminId, action, entityType, entityId, details = '', req) => {
  try {
    await AuditLog.create({
      admin: adminId,
      action,
      targetEntity: { entityType, entityId },
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
    });
  } catch (error) {
    console.error('Audit log creation failed:', error);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalWorkers, totalProviders, totalJobs, openJobs, completedJobs, totalTransactions, pendingReports] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: 'worker' }),
      User.countDocuments({ role: 'provider' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'open' }),
      Job.countDocuments({ status: 'closed' }),
      Transaction.countDocuments(),
      Report.countDocuments({ status: { $in: ['pending', 'under-review'] } }),
    ]);

    const totalEarnings = await Transaction.aggregate([
      { $match: { status: 'released' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const earnings = totalEarnings.length > 0 ? totalEarnings[0].total : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalWorkers,
        totalProviders,
        totalJobs,
        openJobs,
        completedJobs,
        totalTransactions,
        totalEarnings: earnings,
        pendingReports,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role, isBlocked, isVerified, search, page = 1, limit = 20 } = req.query;

    const filter = { role: { $ne: 'admin' } };
    if (role) filter.role = role;
    if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password -otp')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let additionalData = {};
    if (user.role === 'worker') {
      additionalData.workerProfile = await Worker.findOne({ user: user._id });
    } else if (user.role === 'provider') {
      additionalData.providerProfile = await Provider.findOne({ user: user._id });
    }

    const reviews = await Review.find({ reviewee: user._id })
      .populate('reviewer', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, data: { ...user.toObject(), ...additionalData, reviews } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot block admin users' });
    }

    user.isBlocked = true;
    user.blockedReason = reason || 'Policy violation';
    user.blockedAt = new Date();
    await user.save();

    await createAuditLog(req.user._id, 'USER_BLOCKED', 'User', user._id, reason, req);

    res.json({ success: true, message: 'User blocked successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBlocked = false;
    user.blockedReason = '';
    user.blockedAt = null;
    await user.save();

    await createAuditLog(req.user._id, 'USER_UNBLOCKED', 'User', user._id, '', req);

    res.json({ success: true, message: 'User unblocked successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isVerified = true;
    user.verifiedAt = new Date();
    await user.save();

    await createAuditLog(req.user._id, 'USER_VERIFIED', 'User', user._id, '', req);

    res.json({ success: true, message: 'User verified successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
    }

    await user.deleteOne();
    await createAuditLog(req.user._id, 'USER_DELETED', 'User', user._id, '', req);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate('provider', 'name email')
      .populate('worker', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('provider', 'name email phone')
      .populate('worker', 'name email phone')
      .populate('job');

    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

    transaction.status = status;
    if (notes) transaction.notes = notes;
    if (status === 'released') transaction.releasedAt = new Date();

    await transaction.save();

    const action = status === 'released' ? 'TRANSACTION_RELEASED' : 'TRANSACTION_REFUNDED';
    await createAuditLog(req.user._id, action, 'Transaction', transaction._id, notes, req);

    res.json({ success: true, message: 'Transaction updated successfully', data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllReports = async (req, res) => {
  try {
    const { status, severity, reportType, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (reportType) filter.reportType = reportType;

    const reports = await Report.find(filter)
      .populate('reporter', 'name email')
      .populate('reportedEntity.entityId')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Report.countDocuments(filter);

    res.json({
      success: true,
      data: reports,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'name email phone')
      .populate('reportedEntity.entityId')
      .populate('resolvedBy', 'name email');

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resolveReport = async (req, res) => {
  try {
    const { adminNotes, action } = req.body; // action: 'dismiss' or 'resolve'
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    report.status = action === 'dismiss' ? 'dismissed' : 'resolved';
    report.adminNotes = adminNotes || '';
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    await report.save();

    const auditAction = action === 'dismiss' ? 'REPORT_DISMISSED' : 'REPORT_RESOLVED';
    await createAuditLog(req.user._id, auditAction, 'Report', report._id, adminNotes, req);

    res.json({ success: true, message: 'Report updated successfully', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    await report.deleteOne();
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    await review.deleteOne();
    await createAuditLog(req.user._id, 'REVIEW_DELETED', 'Review', review._id, '', req);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const jobs = await Job.find(filter)
      .populate('provider')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: jobs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    await job.deleteOne();
    await createAuditLog(req.user._id, 'JOB_DELETED', 'Job', job._id, '', req);

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    worker.isApproved = req.body.isApproved !== undefined ? req.body.isApproved : true;
    await worker.save();
    res.json({ success: true, message: `Worker ${worker.isApproved ? 'approved' : 'rejected'}`, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveProvider = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    provider.isApproved = req.body.isApproved !== undefined ? req.body.isApproved : true;
    await provider.save();
    res.json({ success: true, message: `Provider ${provider.isApproved ? 'approved' : 'rejected'}`, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { action, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter)
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
  verifyUser,
  toggleUserStatus,
  deleteUser,
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
  getAllReports,
  getReportById,
  resolveReport,
  deleteReport,
  deleteReview,
  getAllJobs,
  deleteJob,
  approveWorker,
  approveProvider,
  getAuditLogs,
};