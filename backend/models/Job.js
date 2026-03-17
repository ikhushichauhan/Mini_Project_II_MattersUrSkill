const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    category: {
      type: String,
      required: true,
    },
    skillsRequired: [
      {
        type: String,
      },
    ],
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
    },
    location: {
      type: String,
      default: 'Remote',
    },
    salary: {
      type: Number,
      default: 0,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'freelance', 'internship'],
      default: 'freelance',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'closed'],
      default: 'open',
    },
    applicants: [
      {
        worker: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Worker',
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
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);