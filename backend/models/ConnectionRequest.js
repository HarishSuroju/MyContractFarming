const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
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
  // Detailed connection request fields
  cropType: {
    type: String
  },
  season: {
    type: String
  },
  landArea: {
    type: Number
  },
  expectedPrice: {
    type: Number
  },
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
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

const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema);

module.exports = { ConnectionRequest };