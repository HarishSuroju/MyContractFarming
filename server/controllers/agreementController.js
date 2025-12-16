const { Agreement, User } = require('../models/User');

// Create a new agreement
const createAgreement = async (req, res) => {
  try {
    const { farmerId, contractorId, season, crop, quantity, price, duration, terms } = req.body;
    const creatorId = req.user.userId;

    // Validate that both farmer and contractor exist
    const farmer = await User.findById(farmerId);
    const contractor = await User.findById(contractorId);

    if (!farmer || !contractor) {
      return res.status(404).json({
        status: 'error',
        message: 'Farmer or contractor not found'
      });
    }

    // Create agreement
    const agreement = new Agreement({
      farmer: farmerId,
      contractor: contractorId,
      season,
      crop,
      quantity,
      price,
      duration,
      terms
    });

    await agreement.save();

    res.status(201).json({
      status: 'success',
      message: 'Agreement created successfully',
      data: { agreement }
    });
  } catch (error) {
    console.error('Create agreement error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating agreement'
    });
  }
};

// Get agreements for a user
const getUserAgreements = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find agreements where user is either farmer or contractor
    const agreements = await Agreement.find({
      $or: [
        { farmer: userId },
        { contractor: userId }
      ]
    })
    .populate('farmer', 'name email')
    .populate('contractor', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { agreements }
    });
  } catch (error) {
    console.error('Get agreements error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching agreements'
    });
  }
};

// Update agreement status
const updateAgreementStatus = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Find agreement
    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Check if user is authorized to update this agreement
    if (agreement.farmer.toString() !== userId && agreement.contractor.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this agreement'
      });
    }

    // Update status
    agreement.status = status;
    await agreement.save();

    res.status(200).json({
      status: 'success',
      message: 'Agreement status updated successfully',
      data: { agreement }
    });
  } catch (error) {
    console.error('Update agreement status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating agreement status'
    });
  }
};

// Get specific agreement details
const getAgreementById = async (req, res) => {
  try {
    const { agreementId } = req.params;
    
    const agreement = await Agreement.findById(agreementId)
      .populate('farmer', 'name email phone')
      .populate('contractor', 'name email phone');

    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { agreement }
    });
  } catch (error) {
    console.error('Get agreement error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching agreement'
    });
  }
};

module.exports = {
  createAgreement,
  getUserAgreements,
  updateAgreementStatus,
  getAgreementById
};