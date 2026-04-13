const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  markJobCompleted,
  releasePayment,
  getPaymentsByJob,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/mark-completed', protect, markJobCompleted);
router.put('/job/:jobId/complete', protect, markJobCompleted); // Keep old one for compatibility if needed
router.put('/:paymentId/release', protect, authorizeRoles('admin'), releasePayment);
router.get('/job/:jobId', protect, getPaymentsByJob);

module.exports = router;
