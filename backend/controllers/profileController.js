const mongoose = require('mongoose');
const { FarmerProfile, ContractorProfile, User } = require('../models/User');
const { Agreement } = require('../models/Agreement');

// Create or update farmer profile
const createFarmerProfile = async (req, res) => {
  try {
    const { landSize, landLocation, cropsGrown, experience, seasons, selectedCrop, selectedSeason } = req.body;
    const userId = req.user.userId;

    // Check if profile already exists
    let profile = await FarmerProfile.findOne({ user: userId });

    if (profile) {
      // Update existing profile
      profile.landSize = landSize;
      profile.landLocation = landLocation;
      profile.cropsGrown = cropsGrown;
      profile.experience = experience;
      profile.seasons = seasons || [];
      
      // Update selected crop and season if provided
      if (selectedCrop) profile.selectedCrop = selectedCrop;
      if (selectedSeason) profile.selectedSeason = selectedSeason;
    } else {
      // Create new profile
      profile = new FarmerProfile({
        user: userId,
        landSize,
        landLocation,
        cropsGrown,
        experience,
        seasons,
        selectedCrop: selectedCrop || undefined,
        selectedSeason: selectedSeason || undefined
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
    const { companyName, companyLocation, cropDemand, contractPreferences, seasons, selectedCrop, selectedSeason } = req.body;
    const userId = req.user.userId;

    // Check if profile already exists
    let profile = await ContractorProfile.findOne({ user: userId });

    if (profile) {
      // Update existing profile
      profile.companyName = companyName;
      profile.companyLocation = companyLocation;
      profile.cropDemand = cropDemand;
      profile.contractPreferences = contractPreferences;
      if (seasons) profile.seasons = seasons;
      
      // Update selected crop and season if provided
      if (selectedCrop) profile.selectedCrop = selectedCrop;
      if (selectedSeason) profile.selectedSeason = selectedSeason;
    } else {
      // Create new profile
      profile = new ContractorProfile({
        user: userId,
        companyName,
        companyLocation,
        cropDemand,
        contractPreferences,
        seasons: seasons || [],
        selectedCrop: selectedCrop || undefined,
        selectedSeason: selectedSeason || undefined
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

// Get all users for directory (public endpoint)
const getAllUsers = async (req, res) => {
  try {
    // Fetch all users with their profiles, excluding admins
    const users = await User.find({ isVerified: true, role: { $ne: 'admin' } }).select('-password');
    
    // Get farmer and contractor profiles
    const farmerProfiles = await FarmerProfile.find().populate('user', 'name email phone');
    const contractorProfiles = await ContractorProfile.find().populate('user', 'name email phone');
    
    // Combine user data with their profiles
    const usersWithProfiles = users.map(user => {
      let profile = null;
      let profileType = null;
      
      if (user.role === 'farmer') {
        profile = farmerProfiles.find(fp => fp.user && fp.user._id.toString() === user._id.toString());
        profileType = 'farmer';
      } else if (user.role === 'contractor') {
        profile = contractorProfiles.find(cp => cp.user && cp.user._id.toString() === user._id.toString());
        profileType = 'contractor';
      }
      
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileComplete: user.profileComplete,
        profile: profile ? {
          ...(profileType === 'farmer' ? {
            landSize: profile.landSize,
            landLocation: profile.landLocation,
            cropsGrown: profile.cropsGrown,
            experience: profile.experience,
            seasons: profile.seasons,
            selectedCrop: profile.selectedCrop,
            selectedSeason: profile.selectedSeason
          } : {
            companyName: profile.companyName,
            companyLocation: profile.companyLocation,
            cropDemand: profile.cropDemand,
            contractPreferences: profile.contractPreferences,
            seasons: profile.seasons,
            selectedCrop: profile.selectedCrop,
            selectedSeason: profile.selectedSeason
          })
        } : null
      };
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Users fetched successfully',
      data: { users: usersWithProfiles }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching users'
    });
  }
};

// Get a specific user by ID for directory (public endpoint)
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Convert userId to ObjectId if it's a valid hex string
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user ID format'
      });
    }
    
    // Fetch the specific user, excluding admins
    // Try with ObjectId conversion first
    let user = await User.findOne({ _id: objectId, role: { $ne: 'admin' } }).select('-password');
    
    // If not found, try matching by comparing string representations
    if (!user) {
      // Get all users and find by string comparison
      const allUsers = await User.find({}).select('-password');
      user = allUsers.find(u => u._id.toString() === userId);
    }
    
    if (!user || !user.isVerified) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found or not verified'
      });
    }
    
    // Get the user's profile based on their role
    let profile = null;
    let profileType = null;
    
    if (user.role === 'farmer') {
      profile = await FarmerProfile.findOne({ user: userId }).populate('user', 'name email phone');
      profileType = 'farmer';
    } else if (user.role === 'contractor') {
      profile = await ContractorProfile.findOne({ user: userId }).populate('user', 'name email phone');
      profileType = 'contractor';
    }
    
    const userWithProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileComplete: user.profileComplete,
      profile: profile ? {
        ...(profileType === 'farmer' ? {
          landSize: profile.landSize,
          landLocation: profile.landLocation,
          cropsGrown: profile.cropsGrown,
          experience: profile.experience,
          seasons: profile.seasons,
          selectedCrop: profile.selectedCrop,
          selectedSeason: profile.selectedSeason
        } : {
          companyName: profile.companyName,
          companyLocation: profile.companyLocation,
          cropDemand: profile.cropDemand,
          contractPreferences: profile.contractPreferences,
          seasons: profile.seasons,
          selectedCrop: profile.selectedCrop,
          selectedSeason: profile.selectedSeason
        })
      } : null
    };
    
    res.status(200).json({
      status: 'success',
      message: 'User fetched successfully',
      data: { user: userWithProfile }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching user'
    });
  }
};

const getMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('farmerProfile').populate('contractorProfile');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    
    let matches = [];
    if (user.role === 'farmer') {
      // Find contractors whose cropDemand includes the selected crop AND season is in their seasons list
      const farmerProfile = await FarmerProfile.findOne({ user: req.user.userId });
      if (!farmerProfile) {
        return res.status(404).json({ status: 'error', message: 'Farmer profile not found' });
      }
      
      const selectedCrop = farmerProfile.selectedCrop;
      const selectedSeason = farmerProfile.selectedSeason;
      
      // If both crop and season are selected, find contractors with matching crop AND season
      if (selectedCrop && selectedSeason) {
        matches = await ContractorProfile.find({
          cropDemand: { $in: [selectedCrop] },
          seasons: { $in: [selectedSeason] }  // Check if selected season is in contractor's seasons
        })
        .populate('user', 'name email phone')
        .lean();
      } else if (selectedCrop) {
        // If only crop is selected, find contractors with matching crop
        matches = await ContractorProfile.find({
          cropDemand: { $in: [selectedCrop] }
        })
        .populate('user', 'name email phone')
        .lean();
      } else {
        // Fallback
        matches = [];
      }
      
      // Filter matches to only include contractors with no conflicting agreements in selected season
      const filteredMatches = [];
      for (const contractor of matches) {
        // For each contractor, check if they have any agreements in the selected season
        const conflictingAgreements = await Agreement.find({
          contractor: contractor.user._id,
          season: selectedSeason,
          status: { $in: ['pending', 'accepted', 'completed'] } // Only consider active agreements
        });
        
        if (conflictingAgreements.length === 0) {
          // Add user-friendly fields to the response
          filteredMatches.push({
            id: contractor._id,
            name: contractor.user.name,
            location: contractor.companyLocation,
            cropDemand: contractor.cropDemand,
            companyName: contractor.companyName,
            email: contractor.user.email,
            phone: contractor.user.phone
          });
        }
      }
      
      matches = filteredMatches;
    } else if (user.role === 'contractor') {
      // Find farmers whose cropsGrown includes the selected crop AND season is in their available seasons
      const contractorProfile = await ContractorProfile.findOne({ user: req.user.userId });
      if (!contractorProfile) {
        return res.status(404).json({ status: 'error', message: 'Contractor profile not found' });
      }
      
      const selectedCrop = contractorProfile.selectedCrop;
      const selectedSeason = contractorProfile.selectedSeason;
      
      // Find farmers with matching crop AND season in their available seasons
      if (selectedCrop && selectedSeason) {
        matches = await FarmerProfile.find({
          cropsGrown: { $in: [selectedCrop] },
          seasons: { $in: [selectedSeason] }  // Check if selected season is in farmer's seasons
        })
        .populate('user', 'name email phone')
        .lean();
      } else if (selectedCrop) {
        // If only crop is selected, find farmers with matching crop
        matches = await FarmerProfile.find({
          cropsGrown: { $in: [selectedCrop] }
        })
        .populate('user', 'name email phone')
        .lean();
      } else {
        // Fallback
        matches = [];
      }
      
      // Filter matches to only include farmers with no conflicting agreements in selected season
      const filteredMatches = [];
      for (const farmer of matches) {
        // For each farmer, check if they have any agreements in the selected season
        const conflictingAgreements = await Agreement.find({
          farmer: farmer.user._id,
          season: selectedSeason,
          status: { $in: ['pending', 'accepted', 'completed'] }
        });
        
        if (conflictingAgreements.length === 0) {
          // Add user-friendly fields to the response
          filteredMatches.push({
            id: farmer._id,
            name: farmer.user.name,
            location: farmer.landLocation,
            cropsGrown: farmer.cropsGrown,
            experience: farmer.experience,
            landSize: farmer.landSize,
            seasons: farmer.seasons,
            email: farmer.user.email,
            phone: farmer.user.phone
          });
        }
      }
      
      matches = filteredMatches;
    }

    res.status(200).json({ 
      status: 'success', 
      message: 'Matches found successfully',
      data: { matches } 
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error fetching matches' 
    });
  }
};

module.exports = {
  createFarmerProfile,
  createContractorProfile,
  getProfile,
  getMatches,
  getAllUsers,
  getUserById
};