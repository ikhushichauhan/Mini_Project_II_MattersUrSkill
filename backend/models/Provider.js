const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    jobsPosted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Provider', providerSchema);