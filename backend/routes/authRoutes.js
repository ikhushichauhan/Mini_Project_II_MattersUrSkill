const express        = require('express');
const router         = express.Router();
const User           = require('../models/User');
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

router.post('/create-first-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const { name, email, password, dateOfBirth } = req.body;

    const admin = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'admin',
      dateOfBirth: new Date(dateOfBirth),
      phoneVerified: true,
      isActive: true,
      isApproved: true,
      isVerified: true,
    });

    res.json({ 
      success: true, 
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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