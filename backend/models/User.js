const mongoose = require('mongoose');

// Farmer Profile Schema
const farmerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  landSize: String,
  landLocation: String,
  cropsGrown: [String],
  experience: String,
  seasons: [String],
  selectedCrop: String,
  selectedSeason: String
});

// Contractor Profile Schema
const contractorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: String,
  companyLocation: String,
  cropDemand: [String],
  contractPreferences: String,
  seasons: [String],
  selectedCrop: String,
  selectedSeason: String
});

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['farmer', 'contractor', 'admin'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isBlocked: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create models
const User = mongoose.model('User', userSchema);
const FarmerProfile = mongoose.model('FarmerProfile', farmerProfileSchema);
const ContractorProfile = mongoose.model('ContractorProfile', contractorProfileSchema);

module.exports = {
  User,
  FarmerProfile,
  ContractorProfile
};