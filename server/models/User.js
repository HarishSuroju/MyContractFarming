const mongoose = require('mongoose');

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
    enum: ['farmer', 'contractor'],
    required: true
  },
  profileComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Farmer specific profile data
const farmerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  landSize: {
    type: String,
    required: true
  },
  landLocation: {
    type: String,
    required: true
  },
  cropsGrown: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  seasons: [{
    type: String,
    enum: ['Kharif', 'Rabi', 'Zaid']
  }]
}, {
  timestamps: true
});

// Contractor specific profile data
const contractorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  companyLocation: {
    type: String,
    required: true
  },
  cropDemand: {
    type: String,
    required: true
  },
  contractPreferences: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Agreement/Contract model
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
  season: {
    type: String,
    required: true
  },
  crop: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  terms: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = {
  User: mongoose.model('User', userSchema),
  FarmerProfile: mongoose.model('FarmerProfile', farmerProfileSchema),
  ContractorProfile: mongoose.model('ContractorProfile', contractorProfileSchema),
  Agreement: mongoose.model('Agreement', agreementSchema)
};