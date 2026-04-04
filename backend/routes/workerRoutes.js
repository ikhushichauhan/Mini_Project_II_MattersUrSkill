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
router.get('/profile', protect, getWorkerProfile);
router.get('/profile/:userId', protect, async (req, res) => {
  try {
    const Worker = require('../models/Worker');
    const workerProfile = await Worker.findOne({ user: req.params.userId });
    if (!workerProfile) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }
    res.json({ success: true, data: workerProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.put('/profile', protect, updateWorkerProfile);
router.get('/my-applications', protect, getMyApplications);
router.post('/apply/:jobId', protect, applyForJob);
router.get('/:id', getWorkerById);

module.exports = router;