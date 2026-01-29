const mongoose = require('mongoose');

const fraudAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['agreement_rejection_spike', 'payment_abuse', 'rating_abnormal'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  context: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  }
});

const FraudAlert = mongoose.model('FraudAlert', fraudAlertSchema);

module.exports = { FraudAlert };

