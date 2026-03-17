const User             = require('../models/User');
const Worker           = require('../models/Worker');
const Provider         = require('../models/Provider');
const generateToken    = require('../utils/generateToken');
const { sendOTPEmail } = require('../utils/emailService');
const crypto           = require('crypto');

const OTP_EXPIRY_MINUTES = 5;

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOTP     = (otp) => crypto.createHash('sha256').update(otp).digest('hex');
const maskEmail   = (e) => {
  const [local, domain] = String(e).split('@');
  const masked = local[0] + '***' + (local.length > 2 ? local[local.length - 1] : '');
  return `${masked}@${domain}`;
};

const calculateAge = (dob) => {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
};

const userResponse = (user, withToken = true) => ({
  _id:          user._id,
  name:         user.name,
  email:        user.email,
  role:         user.role,
  dateOfBirth:  user.dateOfBirth,
  age:          calculateAge(user.dateOfBirth),
  phone:        user.phone,
  profileImage: user.profileImage,
  bio:          user.bio,
  skills:       user.skills,
  location:     user.location,
  availability: user.availability,
  ratings:      user.ratings,
  isApproved:   user.isApproved,
  ...(withToken && { token: generateToken(user._id) }),
});

const issueVerificationOtp = async (user) => {
  const otp       = generateOTP();
  const hashedOtp = hashOTP(otp);

  user.otp = {
    code:            hashedOtp,
    expiresAt:       new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    lastRequestedAt: new Date(),
    attempts:        0,
  };

  await user.save({ validateBeforeSave: false });

  const devOTP = await sendOTPEmail(user.email, user.name, otp);

  return {
    devOTP,
    maskedEmail: maskEmail(user.email),
  };
};

const register = async (req, res, next) => {
  try {
    const {
      name, email, password, role, dateOfBirth,
      phone, bio, skills, location, availability, category, profileImage,
    } = req.body;
    const cleanedEmail = String(email || '').toLowerCase().trim();

    if (!name || !cleanedEmail || !password || !dateOfBirth) {
      res.status(400);
      return next(new Error('Please provide name, email, password and dateOfBirth'));
    }

    const age = calculateAge(dateOfBirth);
    if (isNaN(age) || age < 0) {
      res.status(400);
      return next(new Error('Please provide a valid date of birth'));
    }
    if (age < 18) {
      res.status(400);
      return next(new Error('You must be at least 18 years old to register'));
    }

    const userRole = ['worker', 'provider'].includes(role) ? role : 'user';

    const userExists = await User.findOne({ email: cleanedEmail });
    if (userExists) {
      if (userExists.phoneVerified) {
        res.status(400);
        return next(new Error('An account with this email already exists'));
      }

      userExists.name = name;
      userExists.email = cleanedEmail;
      userExists.password = password;
      userExists.role = userRole;
      userExists.dateOfBirth = dateOfBirth;
      userExists.phone = phone || '';
      userExists.profileImage = profileImage || '';
      userExists.bio = bio || '';
      userExists.skills = skills || [];
      userExists.location = location || {};
      userExists.availability = availability || {};

      const { devOTP, maskedEmail } = await issueVerificationOtp(userExists);

      return res.status(200).json({
        success: true,
        pendingVerification: true,
        email: maskedEmail,
        message: `A fresh verification code has been sent to ${maskedEmail}. Check your inbox.`,
        ...(devOTP && { devOTP }),
      });
    }

    const user = await User.create({
      name,
      email: cleanedEmail,
      password,
      role: userRole,
      dateOfBirth,
      phone:        phone        || '',
      profileImage: profileImage || '',
      bio:          bio          || '',
      skills:       skills       || [],
      location:     location     || {},
      availability: availability || {},
    });

    if (role === 'worker') {
      await Worker.create({
        user:     user._id,
        category: category || 'other',
        skills:   skills   || [],
        location: location?.city || '',
      });
    } else if (role === 'provider') {
      await Provider.create({ user: user._id });
    }

    const { devOTP, maskedEmail } = await issueVerificationOtp(user);

    return res.status(201).json({
      success:             true,
      pendingVerification: true,
      email:               maskedEmail,
      message:             `Account created! Verification code sent to ${maskedEmail}. Check your inbox.`,
      ...(devOTP && { devOTP }),
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error('Please provide email and password'));
    }

    const cleanedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: cleanedEmail }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    if (!user.isActive) {
      res.status(403);
      return next(new Error('Your account has been deactivated. Contact support.'));
    }

    res.json({ success: true, data: userResponse(user) });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }
    res.json({ success: true, data: userResponse(user, false) });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const scalarFields = ['name', 'phone', 'profileImage', 'bio'];
    scalarFields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    if (req.body.skills       !== undefined) user.skills       = req.body.skills;
    if (req.body.location     !== undefined) user.location     = req.body.location;
    if (req.body.availability !== undefined) user.availability = req.body.availability;

    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();
    res.json({ success: true, data: userResponse(updated) });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      return next(new Error('Please provide currentPassword and newPassword'));
    }

    if (newPassword.length < 6) {
      res.status(400);
      return next(new Error('New password must be at least 6 characters'));
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Current password is incorrect'));
    }

    user.password = newPassword; // pre-save middleware will hash it
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };