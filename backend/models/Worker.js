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
      enum: ['student', 'housewife', 'unemployed', 'other'],
      required: true,
    },
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