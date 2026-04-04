const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    budget: {
      amount: {
        type: Number,
        required: [true, 'Budget amount is required'],
        min: [0, 'Budget cannot be negative'],
      },
      currency: {
        type: String,
        default: 'INR',
      },
      type: {
        type: String,
        enum: ['fixed', 'hourly', 'negotiable'],
        default: 'fixed',
      },
    },

    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      isRemote: { type: Boolean, default: false },
    },

    duration: {
      value: {
        type: Number,
        required: [true, 'Duration value is required'],
        min: [1, 'Duration must be at least 1'],
      },
      unit: {
        type: String,
        enum: ['hours', 'days', 'weeks', 'months'],
        default: 'days',
      },
    },

    category: {
      type: String,
      trim: true,
      default: '',
    },
    skillsRequired: {
      type: [String],
      default: [],
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'PostedBy (User) is required'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['open', 'in-progress', 'completed', 'cancelled'],
        message: 'Status must be open, in-progress, completed, or cancelled',
      },
      default: 'open',
    },

    applications: [
      {
        applicant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        message: {
          type: String,
          default: '',
        },
        availability: {
          startDate: {
            type: String,
            trim: true,
          },
          hoursPerWeek: {
            type: String,
            trim: true,
          },
        },
        expectedRate: {
          amount: {
            type: Number,
            min: [0, 'Expected rate cannot be negative'],
          },
          currency: {
            type: String,
            default: 'INR',
          },
          type: {
            type: String,
            enum: ['fixed', 'hourly', 'monthly', 'other'],
            default: 'fixed',
          },
        },
        portfolioLink: {
          type: String,
          trim: true,
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
      },
    ],

    deadline: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
    rating: {
      score: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
        default: null,
      },
      review: {
        type: String,
        default: '',
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // auto-adds createdAt & updatedAt
  }
);

taskSchema.index({ status: 1 });
taskSchema.index({ postedBy: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ 'location.city': 1 });
taskSchema.index({ category: 1 });

taskSchema.virtual('locationText').get(function () {
  if (this.location.isRemote) return 'Remote';
  return [this.location.city, this.location.state, this.location.pincode]
    .filter(Boolean)
    .join(', ');
});

taskSchema.virtual('durationText').get(function () {
  return `${this.duration.value} ${this.duration.unit}`;
});

taskSchema.methods.assignWorker = async function (userId) {
  this.assignedTo = userId;
  this.status     = 'in-progress';
  return this.save();
};

taskSchema.methods.markCompleted = async function (ratingScore, reviewText) {
  this.status      = 'completed';
  this.completedAt = new Date();
  if (ratingScore !== undefined) {
    this.rating.score  = ratingScore;
    this.rating.review = reviewText || '';
  }
  return this.save();
};

module.exports = mongoose.model('Task', taskSchema);