const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All routes require admin authentication
router.use(protect, authorizeRoles('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.patch('/users/:id/verify', verifyUser);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Transaction Management
router.get('/transactions', getAllTransactions);
router.get('/transactions/:id', getTransactionById);
router.patch('/transactions/:id', updateTransactionStatus);

// Report Management
router.get('/reports', getAllReports);
router.get('/reports/:id', getReportById);
router.patch('/reports/:id/resolve', resolveReport);
router.delete('/reports/:id', deleteReport);

// Review Management
router.delete('/reviews/:id', deleteReview);

// Job Management
router.get('/jobs', getAllJobs);
router.delete('/jobs/:id', deleteJob);

// Worker & Provider Approval
router.put('/workers/:id/approve', approveWorker);
router.put('/providers/:id/approve', approveProvider);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;