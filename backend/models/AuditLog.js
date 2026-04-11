const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'USER_BLOCKED',
        'USER_UNBLOCKED',
        'USER_VERIFIED',
        'USER_DELETED',
        'TRANSACTION_RELEASED',
        'TRANSACTION_REFUNDED',
        'REPORT_RESOLVED',
        'REPORT_DISMISSED',
        'REVIEW_DELETED',
        'JOB_DELETED',
      ],
    },
    targetEntity: {
      entityType: {
        type: String,
        enum: ['User', 'Transaction', 'Report', 'Review', 'Job'],
        required: true,
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ admin: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
