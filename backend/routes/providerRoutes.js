const express = require('express');
const router = express.Router();
const {
  getProviderProfile,
  updateProviderProfile,
  getAllProviders,
  postJob,
  getMyJobs,
  updateApplicationStatus,
  deleteJob,
} = require('../controllers/providerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllProviders);
router.get('/profile', protect, getProviderProfile);
router.put('/profile', protect, updateProviderProfile);
router.post('/jobs', protect, postJob);
router.get('/jobs', protect, getMyJobs);
router.put('/jobs/:jobId/applicants/:workerId', protect, updateApplicationStatus);
router.delete('/jobs/:jobId', protect, deleteJob);

module.exports = router;