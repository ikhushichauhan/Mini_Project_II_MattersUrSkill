const express = require('express');
const router = express.Router();
const {
  getWorkerProfile,
  updateWorkerProfile,
  getAllWorkers,
  getWorkerById,
  applyForJob,
  getMyApplications,
} = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllWorkers);
router.get('/:id', getWorkerById);
router.get('/profile', protect, getWorkerProfile);
router.put('/profile', protect, updateWorkerProfile);
router.post('/apply/:jobId', protect, applyForJob);
router.get('/my-applications', protect, getMyApplications);

module.exports = router;