const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  deleteUser,
  approveWorker,
  approveProvider,
  getDashboardStats,
  getAllJobs,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect, authorizeRoles('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.put('/workers/:id/approve', approveWorker);
router.put('/providers/:id/approve', approveProvider);
router.get('/jobs', getAllJobs);

module.exports = router;