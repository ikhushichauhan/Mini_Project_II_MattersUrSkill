const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    bio: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['student', 'housewife', 'unemployed', 'graduate', 'other'],
      required: true,
    },
    isGraduate: {
      type: Boolean,
      default: false,
    },
    cv: {
      fileName: {
        type: String,
        trim: true,
      },
      fileType: {
        type: String,
        trim: true,
      },
      fileSize: {
        type: Number,
        min: 0,
      },
      fileData: {
        type: String,
      },
      uploadedAt: {
        type: Date,
      },
    },
    workExperience: [
      {
        title: {
          type: String,
          trim: true,
        },
        company: {
          type: String,
          trim: true,
        },
        location: {
          type: String,
          trim: true,
        },
        startDate: {
          type: String,
          trim: true,
        },
        endDate: {
          type: String,
          trim: true,
        },
        currentlyWorking: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
          trim: true,
          maxlength: 600,
        },
      },
    ],
    availability: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalJobsDone: {
      type: Number,
      default: 0,
    },
    portfolio: [
      {
        title: String,
        description: String,
        link: String,
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Worker', workerSchema);