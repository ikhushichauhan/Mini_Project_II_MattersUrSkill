const express        = require('express');
const router         = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { sendOTP, verifyOTP } = require('../controllers/otpController');
const { protect }          = require('../middleware/authMiddleware');
const { authorizeRoles }   = require('../middleware/roleMiddleware');

router.post('/register', register);          // POST /api/auth/register
router.post('/login',    login);             // POST /api/auth/login

router.post('/otp/send',   sendOTP);   // POST /api/auth/otp/send   { email }
router.post('/otp/verify', verifyOTP); // POST /api/auth/otp/verify  { email, otp }

router.get ('/me',              protect, getMe);           // GET  /api/auth/me
router.get ('/user/:id',        protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.put ('/me',              protect, updateProfile);   // PUT  /api/auth/me
router.put ('/change-password', protect, changePassword);  // PUT  /api/auth/change-password

module.exports = router;