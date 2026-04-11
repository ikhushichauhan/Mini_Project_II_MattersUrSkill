const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'on-hold', 'released', 'refunded', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['wallet', 'upi', 'card', 'netbanking', 'cash'],
      default: 'wallet',
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    notes: {
      type: String,
      default: '',
    },
    releasedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ provider: 1, createdAt: -1 });
transactionSchema.index({ worker: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
