const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contractorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cropType: {
    type: String,
    required: true
  },
  landArea: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  inputsSupplied: [String],
  season: {
    type: String,
    required: true
  },
  terms: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'accepted', 'rejected', 'active', 'completed', 'terminated'],
    default: 'pending'
  },
  farmerSignature: {
    type: Boolean,
    default: false
  },
  contractorSignature: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  crop: {
    type: String
  },
  quantity: {
    type: Number
  },
  priceTerms: {
    type: String
  },
  deliveryTimeline: {
    type: String
  },
  agreementText: {
    type: String
  },
  adminApproved: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpGeneratedAt: {
    type: Date
  },
  acceptedAt: {
    type: Date
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

const Agreement = mongoose.model('Agreement', agreementSchema);

module.exports = { Agreement };