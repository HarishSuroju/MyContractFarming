const { Agreement } = require('../models/Agreement');
const { User } = require('../models/User');
const {
  logFraudAlert,
  detectAgreementRejectionSpike,
  detectAbnormalRatingBehaviour
} = require('../utils/fraudDetection');

// Create a new agreement between farmer and contractor
const createAgreement = async (req, res) => {
  try {
    const { farmer, contractor, cropType, landArea, duration, salary, inputsSupplied, season, terms } = req.body;
    const userId = req.user.userId;

    // Verify that the current user is either the farmer or contractor
    if (userId !== farmer && userId !== contractor) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to create this agreement'
      });
    }

    // Check if users exist
    const farmerUser = await User.findById(farmer);
    const contractorUser = await User.findById(contractor);

    if (!farmerUser || !contractorUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Farmer or contractor not found'
      });
    }

    if (farmerUser.role !== 'farmer' || contractorUser.role !== 'contractor') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user roles for agreement'
      });
    }

    // Create new agreement
    const agreement = new Agreement({
      farmer,
      contractor,
      cropType,
      landArea,
      duration,
      salary,
      inputsSupplied: inputsSupplied || [],
      season,
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

// Get agreements where the current user participates
const getUserAgreements = async (req, res) => {
  try {
    const userId = req.user.userId;

    const agreements = await Agreement.find({
      $or: [
        { farmer: userId },
        { contractor: userId }
      ]
    }).populate('farmer', 'name email phone').populate('contractor', 'name email phone').sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      message: 'Agreements fetched successfully',
      data: { agreements }
    });
  } catch (error) {
    console.error('Get user agreements error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching agreements'
    });
  }
};

// Get a single agreement by ID (only if user is a party to it)
const getAgreementById = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const userId = req.user.userId;

    const agreement = await Agreement.findOne({
      _id: agreementId,
      $or: [
        { farmer: userId },
        { contractor: userId }
      ]
    }).populate('farmer', 'name email phone').populate('contractor', 'name email phone');

    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found or you are not authorized to view it'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Agreement fetched successfully',
      data: { agreement }
    });
  } catch (error) {
    console.error('Get agreement by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching agreement'
    });
  }
};

// Update agreement lifecycle status (draft, pending, active, completed, etc.)
const updateAgreementStatus = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Validate status
    const validStatuses = ['draft', 'pending', 'accepted', 'rejected', 'active', 'completed', 'terminated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    // Find agreement and check if user is authorized to update
    const agreement = await Agreement.findOne({
      _id: agreementId,
      $or: [
        { farmer: userId },
        { contractor: userId }
      ]
    });

    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found or you are not authorized to update it'
      });
    }

    // Update status
    agreement.status = status;
    agreement.updatedAt = Date.now();
    await agreement.save();

    // Fraud pattern: multiple agreement rejections by same user
    if (status === 'rejected') {
      await detectAgreementRejectionSpike(userId);
    }

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

// Mark that one of the parties has signed the agreement
const signAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const userId = req.user.userId;

    const agreement = await Agreement.findOne({
      _id: agreementId,
      $or: [
        { farmer: userId },
        { contractor: userId }
      ]
    });

    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found or you are not authorized to sign it'
      });
    }

    // Determine which party is signing
    if (userId.equals(agreement.farmer)) {
      agreement.farmerSignature = true;
    } else if (userId.equals(agreement.contractor)) {
      agreement.contractorSignature = true;
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to sign this agreement'
      });
    }

    agreement.updatedAt = Date.now();
    await agreement.save();

    res.status(200).json({
      status: 'success',
      message: 'Agreement signed successfully',
      data: { agreement }
    });
  } catch (error) {
    console.error('Sign agreement error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while signing agreement'
    });
  }
};

// Update agreement fields (contractor-only, while in draft)
const updateAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    // Find agreement and check if user is authorized to update (must be contractor and status must be draft)
    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Only contractor can update, and only if status is draft
    if (userId.toString() !== agreement.contractor.toString() || agreement.status !== 'draft') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to update this agreement'
      });
    }

    // Update agreement
    Object.keys(updateData).forEach(key => {
      if (key !== 'status' && key !== 'farmer' && key !== 'contractor') { // Prevent changing these fields
        agreement[key] = updateData[key];
      }
    });
    
    agreement.updatedAt = Date.now();
    await agreement.save();

    // Get contractor user details
    const { User } = require('../models/User');
    const contractorUser = await User.findById(agreement.contractor);

    // Create notification for the farmer
    const { Notification } = require('../models/Notification');
    const notification = new Notification({
      userId: agreement.farmer.toString(),
      senderId: userId,
      type: 'agreement_sent',
      title: 'Agreement Updated',
      message: `Contractor ${contractorUser ? contractorUser.name : 'Unknown'} updated the agreement`,
      referenceId: agreement._id,
      referenceType: 'agreement'
    });

    await notification.save();

    // Emit real-time notification if farmer is online
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(agreement.farmer.toString()).emit('notification:new', notification);
    }

    res.status(200).json({
      status: 'success',
      message: 'Agreement updated successfully',
      data: { agreement }
    });
  } catch (error) {
    console.error('Update agreement error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating agreement'
    });
  }
};

// Generate and store a one-time password for agreement acceptance
const sendOtp = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const userId = req.user.userId;

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Only farmer can request OTP for acceptance
    if (userId.toString() !== agreement.farmer.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to request OTP for this agreement'
      });
    }

    // Generate OTP (in a real app, this would be stored securely)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP temporarily (in a real app, this would be stored in DB with expiration)
    agreement.otp = otp;
    agreement.otpGeneratedAt = Date.now();
    await agreement.save();

    // Get contractor user details
    const { User } = require('../models/User');
    const contractorUser = await User.findById(agreement.contractor);

    // Create notification for the farmer
    const { Notification } = require('../models/Notification');
    const notification = new Notification({
      userId: agreement.farmer.toString(),
      senderId: agreement.contractor.toString(),
      type: 'agreement_sent',
      title: 'Agreement OTP Ready',
      message: `Contractor ${contractorUser ? contractorUser.name : 'Unknown'} has sent you an agreement to accept. Please check your agreement and enter the OTP to accept.`,
      referenceId: agreement._id,
      referenceType: 'agreement'
    });

    await notification.save();

    // Emit real-time notification if farmer is online
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(agreement.farmer.toString()).emit('notification:new', notification);
    }

    // In a real app, send OTP via SMS/email
    console.log(`OTP for agreement ${agreementId}: ${otp}`);

    res.status(200).json({
      status: 'success',
      message: 'OTP generated and sent successfully',
      data: { otpGenerated: true }
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while sending OTP'
    });
  }
};

// Verify OTP and move agreement to "active" status
const acceptAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { otp } = req.body;
    const userId = req.user.userId;

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Only farmer can accept the agreement
    if (userId.toString() !== agreement.farmer.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to accept this agreement'
      });
    }

    // Verify OTP
    if (!agreement.otp || agreement.otp !== otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OTP'
      });
    }

    // Check if OTP is expired (5 minutes)
    const now = Date.now();
    const otpExpiryTime = 5 * 60 * 1000; // 5 minutes
    if (now - agreement.otpGeneratedAt > otpExpiryTime) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP has expired'
      });
    }

    // Update agreement status to active and clear OTP so it cannot be reused
    agreement.status = 'active';
    agreement.acceptedAt = Date.now();
    agreement.otp = undefined;
    agreement.otpGeneratedAt = undefined;
    await agreement.save();

    // Get farmer user details
    const { User } = require('../models/User');
    const farmerUser = await User.findById(agreement.farmer);

    // Create notification for the contractor
    const { Notification } = require('../models/Notification');
    const notification = new Notification({
      userId: agreement.contractor.toString(),
      senderId: userId,
      type: 'agreement_approved',
      title: 'Agreement Accepted',
      message: `Farmer ${farmerUser ? farmerUser.name : 'Unknown'} has accepted the agreement.`,
      referenceId: agreement._id,
      referenceType: 'agreement'
    });

    await notification.save();

    // Emit real-time notification if contractor is online
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(agreement.contractor.toString()).emit('notification:new', notification);
    }

    res.status(200).json({
      status: 'success',
      message: 'Agreement accepted successfully',
      data: { agreement }
    });
  } catch (error) {
    console.error('Accept agreement error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while accepting agreement'
    });
  }
};

// Initiate a mock payment for an agreement (contractor pays farmer)
const initiateMockPayment = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const userId = req.user.userId;

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Only the contractor on an active agreement can initiate payment
    if (userId.toString() !== agreement.contractor.toString()) {
      await logFraudAlert({
        userId,
        type: 'payment_abuse',
        severity: 'medium',
        title: 'Unauthorized payment attempt',
        description: 'User attempted to initiate payment on an agreement they do not own as contractor.',
        context: { agreementId }
      });
      return res.status(403).json({
        status: 'error',
        message: 'Only the contractor can initiate payment for this agreement'
      });
    }

    if (agreement.status !== 'active' && agreement.status !== 'completed') {
      await logFraudAlert({
        userId,
        type: 'payment_abuse',
        severity: 'low',
        title: 'Payment attempted in invalid agreement state',
        description: `Payment attempted while agreement status is "${agreement.status}".`,
        context: { agreementId, status: agreement.status }
      });
      return res.status(400).json({
        status: 'error',
        message: 'Payment can only be initiated for active or completed agreements'
      });
    }

    // Simulate a payment being processed and completed
    agreement.paymentStatus = 'paid';
    agreement.lastPaymentAt = Date.now();
    await agreement.save();

    const mockPayment = {
      id: `MOCK-${Date.now()}`,
      amount: agreement.salary,
      status: 'completed',
      method: 'mock_gateway',
      processedAt: new Date().toISOString()
    };

    return res.status(200).json({
      status: 'success',
      message: 'Mock payment processed successfully',
      data: {
        agreement,
        payment: mockPayment
      }
    });
  } catch (error) {
    console.error('Initiate mock payment error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while processing mock payment'
    });
  }
};

// Submit rating & review after contract completion
const submitRating = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.userId;

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be a number between 1 and 5'
      });
    }

    const agreement = await Agreement.findById(agreementId);
    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Ratings are only allowed after the contract is completed
    if (agreement.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Ratings can only be submitted after the contract is completed'
      });
    }

    const userIdStr = userId.toString();
    const farmerIdStr = agreement.farmer.toString();
    const contractorIdStr = agreement.contractor.toString();

    if (userIdStr !== farmerIdStr && userIdStr !== contractorIdStr) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to rate this agreement'
      });
    }

    // Contractor rates the farmer
    if (userIdStr === contractorIdStr) {
      if (agreement.farmerRating) {
        return res.status(400).json({
          status: 'error',
          message: 'You have already rated this farmer'
        });
      }
      agreement.farmerRating = rating;
      agreement.farmerReview = review;
    }

    // Farmer rates the contractor
    if (userIdStr === farmerIdStr) {
      if (agreement.contractorRating) {
        return res.status(400).json({
          status: 'error',
          message: 'You have already rated this contractor'
        });
      }
      agreement.contractorRating = rating;
      agreement.contractorReview = review;
    }

    agreement.updatedAt = Date.now();
    await agreement.save();

    // Fraud pattern: abnormal rating behaviour
    const role = userIdStr === contractorIdStr ? 'contractor' : 'farmer';
    await detectAbnormalRatingBehaviour({ userId, role, rating });

    return res.status(200).json({
      status: 'success',
      message: 'Rating submitted successfully',
      data: { agreement }
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error while submitting rating'
    });
  }
};

module.exports = {
  createAgreement,
  getUserAgreements,
  getAgreementById,
  updateAgreementStatus,
  signAgreement,
  updateAgreement,
  sendOtp,
  acceptAgreement,
  initiateMockPayment,
  submitRating
};