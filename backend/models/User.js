const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },

    role: {
      type: String,
      enum: {
        values: ['admin', 'worker', 'provider', 'user'],
        message: 'Role must be admin, worker, provider, or user',
      },
      default: 'user',
    },

    skills: {
      type: [String],
      default: [],
    },

    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },

    availability: {
      isAvailable: { type: Boolean, default: true },
      workType: {
        type: String,
        enum: ['full-time', 'part-time', 'home-based', 'flexible', ''],
        default: 'flexible',
      },
    },

    ratings: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    profileImage: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },

    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },

    phoneVerified: {
      type:    Boolean,
      default: false,
    },

    otp: {
      otpCode: {
        type:   String,
        select: false,
      },
      expiresAt: {
        type:   Date,
        select: false,
      },
      lastRequestedAt: {
        type:   Date,
        select: false,
      },
      attempts: {
        type:    Number,
        default: 0,
        select:  false,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false, // Admin approves worker/provider accounts
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedReason: {
      type: String,
      default: '',
    },
    blockedAt: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // auto-adds createdAt & updatedAt
  }
);

userSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const dob   = new Date(this.dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'location.city': 1 });
userSchema.index({ phone: 1 }, { sparse: true }); // sparse: skips docs where phone is null/absent

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.updateRating = async function (newRating) {
  const total = this.ratings.average * this.ratings.count + newRating;
  this.ratings.count += 1;
  this.ratings.average = parseFloat((total / this.ratings.count).toFixed(2));
  await this.save();
};

module.exports = mongoose.model('User', userSchema);