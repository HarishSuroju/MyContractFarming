const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  receiverName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['farmer', 'contractor'],
    required: true
  },
  receiverRole: {
    type: String,
    enum: ['farmer', 'contractor'],
    required: true
  },
  cropType: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    required: true
  },
  inputsSupplied: [String],
  terms: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['under_review', 'accepted', 'needs_changes', 'rejected'],
    default: 'under_review'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = { Proposal };