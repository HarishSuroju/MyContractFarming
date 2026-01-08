const { FarmerProfile, ContractorProfile, User } = require('../models/User');

// Create or update farmer profile
const createFarmerProfile = async (req, res) => {
  try {
    const { landSize, landLocation, cropsGrown, experience, seasons } = req.body;
    const userId = req.user.userId;

    // Check if profile already exists
    let profile = await FarmerProfile.findOne({ user: userId });

    if (profile) {
      // Update existing profile
      profile.landSize = landSize;
      profile.landLocation = landLocation;
      profile.cropsGrown = cropsGrown;
      profile.experience = experience;
      profile.seasons = seasons;
    } else {
      // Create new profile
      profile = new FarmerProfile({
        user: userId,
        landSize,
        landLocation,
        cropsGrown,
        experience,
        seasons
      });
    }

    await profile.save();

    // Update user profile completion status
    await User.findByIdAndUpdate(userId, { profileComplete: true });

    res.status(200).json({
      status: 'success',
      message: 'Farmer profile saved successfully',
      data: { profile }
    });
  } catch (error) {
    console.error('Farmer profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while saving farmer profile'
    });
  }
};

// Create or update contractor profile
const createContractorProfile = async (req, res) => {
  try {
    const { companyName, companyLocation, cropDemand, contractPreferences } = req.body;
    const userId = req.user.userId;

    // Check if profile already exists
    let profile = await ContractorProfile.findOne({ user: userId });

    if (profile) {
      // Update existing profile
      profile.companyName = companyName;
      profile.companyLocation = companyLocation;
      profile.cropDemand = cropDemand;
      profile.contractPreferences = contractPreferences;
    } else {
      // Create new profile
      profile = new ContractorProfile({
        user: userId,
        companyName,
        companyLocation,
        cropDemand,
        contractPreferences
      });
    }

    await profile.save();

    // Update user profile completion status
    await User.findByIdAndUpdate(userId, { profileComplete: true });

    res.status(200).json({
      status: 'success',
      message: 'Contractor profile saved successfully',
      data: { profile }
    });
  } catch (error) {
    console.error('Contractor profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while saving contractor profile'
    });
  }
};

// Get user profile (farmer or contractor)
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    let profile = null;
    if (user.role === 'farmer') {
      profile = await FarmerProfile.findOne({ user: userId });
    } else if (user.role === 'contractor') {
      profile = await ContractorProfile.findOne({ user: userId });
    }

    res.status(200).json({
      status: 'success',
      data: { user, profile }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching profile'
    });
  }
};

const getMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('farmerProfile').populate('contractorProfile');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    let matches = [];
    if (user.role === 'farmer') {
      // Find contractors whose cropDemand includes any of the farmer's crops
      const farmerCrops = user.farmerProfile?.cropsGrown || [];
      matches = await ContractorProfile.find({ cropDemand: { $in: farmerCrops } }).populate('user');
    } else if (user.role === 'contractor') {
      // Find farmers whose cropsGrown includes any of the contractor's cropDemand
      const contractorDemand = user.contractorProfile?.cropDemand || [];
      matches = await FarmerProfile.find({ cropsGrown: { $in: contractorDemand } }).populate('user');
    }

    res.status(200).json({ matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Server error fetching matches' });
  }
};

module.exports = {
  createFarmerProfile,
  createContractorProfile,
  getProfile,
  getMatches
};