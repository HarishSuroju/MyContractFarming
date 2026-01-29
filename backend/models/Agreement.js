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
    enum: [
      'draft', 
      'pending', 
      'sent_to_contractor', 
      'edited_by_contractor', 
      'accepted_by_contractor', 
      'rejected_by_contractor', 
      'agreement_confirmed', 
      'agreement_rejected', 
      'active', 
      'completed', 
      'terminated',
      'edited_by_farmer',
      'accepted_by_farmer',
      'rejected_by_farmer'
    ],
    default: 'draft'
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
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'processing', 'paid', 'failed'],
    default: 'unpaid'
  },
  lastPaymentAt: {
    type: Date
  },
  farmerRating: {
    // Rating received by the farmer (given by contractor)
    type: Number,
    min: 1,
    max: 5
  },
  farmerReview: {
    type: String,
    maxlength: 1000
  },
  contractorRating: {
    // Rating received by the contractor (given by farmer)
    type: Number,
    min: 1,
    max: 5
  },
  contractorReview: {
    type: String,
    maxlength: 1000
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