const crypto           = require('crypto');
const User             = require('../models/User');
const generateToken    = require('../utils/generateToken');
const { sendOTPEmail } = require('../utils/emailService');

const OTP_EXPIRY_MINUTES     = 5;
const OTP_RATE_LIMIT_SECONDS = 60;
const OTP_MAX_ATTEMPTS       = 5;

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const hashOTP = (otp) =>
  crypto.createHash('sha256').update(otp).digest('hex');

const maskEmail = (email) => {
  const [local, domain] = String(email).split('@');
  const masked = local[0] + '***' + (local.length > 2 ? local[local.length - 1] : '');
  return `${masked}@${domain}`;
};

const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      return next(new Error('Email address is required'));
    }

    const cleanedEmail = String(email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
      res.status(400);
      return next(new Error('Please provide a valid email address'));
    }

    const user = await User.findOne({ email: cleanedEmail }).select(
      '+otp.otpCode +otp.expiresAt +otp.lastRequestedAt +otp.attempts'
    );

    if (!user) {
      res.status(404);
      return next(
        new Error(
          'No account found with this email address. Please register first.'
        )
      );
    }

    if (!user.isActive) {
      res.status(403);
      return next(new Error('Your account has been deactivated. Contact support.'));
    }

    if (user.otp && user.otp.lastRequestedAt) {
      const elapsedSeconds =
        (Date.now() - new Date(user.otp.lastRequestedAt).getTime()) / 1000;
      if (elapsedSeconds < OTP_RATE_LIMIT_SECONDS) {
        const waitSeconds = Math.ceil(OTP_RATE_LIMIT_SECONDS - elapsedSeconds);
        res.status(429);
        return next(
          new Error(
            `Too many OTP requests. Please wait ${waitSeconds} second${waitSeconds !== 1 ? 's' : ''} before trying again.`
          )
        );
      }
    }

    const otp       = generateOTP();
    const hashedOtp = hashOTP(otp);

    user.otp = {
      otpCode:         hashedOtp,
      expiresAt:       new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      lastRequestedAt: new Date(),
      attempts:        0,
    };
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail(cleanedEmail, user.name, otp);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${maskEmail(cleanedEmail)}`,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400);
      return next(new Error('Email address and OTP are required'));
    }

    if (!/^\d{6}$/.test(String(otp))) {
      res.status(400);
      return next(new Error('OTP must be exactly 6 digits'));
    }

    const cleanedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: cleanedEmail }).select(
      '+otp.otpCode +otp.expiresAt +otp.lastRequestedAt +otp.attempts'
    );

    if (!user) {
      res.status(404);
      return next(new Error('No account found with this email address'));
    }

    if (!user.isActive) {
      res.status(403);
      return next(new Error('Your account has been deactivated. Contact support.'));
    }

    if (!user.otp || !user.otp.otpCode) {
      res.status(400);
      return next(new Error('No OTP found. Please request a new verification email first.'));
    }

    if (user.otp.attempts >= OTP_MAX_ATTEMPTS) {
      user.otp.otpCode   = undefined;
      user.otp.expiresAt = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(429);
      return next(
        new Error('Too many failed attempts. OTP has been invalidated. Please request a new OTP.')
      );
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      res.status(400);
      return next(new Error('OTP has expired. Please request a new one.'));
    }

    const hashedInput = hashOTP(String(otp));
    const isMatch =
      crypto.timingSafeEqual(
        Buffer.from(hashedInput,        'hex'),
        Buffer.from(user.otp.otpCode,   'hex')
      );

    if (!isMatch) {
      user.otp.attempts += 1;
      await user.save({ validateBeforeSave: false });
      const remaining = OTP_MAX_ATTEMPTS - user.otp.attempts;
      res.status(401);
      return next(
        new Error(
          `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
        )
      );
    }

    user.phoneVerified   = true;
    user.otp.otpCode     = undefined;
    user.otp.expiresAt   = undefined;
    user.otp.attempts    = 0;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        _id:           user._id,
        name:          user.name,
        email:         user.email,
        role:          user.role,
        phone:         user.phone,
        phoneVerified: user.phoneVerified,
        dateOfBirth:   user.dateOfBirth,
        profileImage:  user.profileImage,
        bio:           user.bio,
        skills:        user.skills,
        location:      user.location,
        availability:  user.availability,
        ratings:       user.ratings,
        isApproved:    user.isApproved,
        token:         generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendOTP, verifyOTP };
