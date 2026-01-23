const { Agreement } = require('../models/Agreement');
const { User } = require('../models/User');

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
        message: 'You are not authorized to accept this agreement'
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

    // Update agreement status to active
    agreement.status = 'active';
    agreement.acceptedAt = Date.now();
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

module.exports = {
  createAgreement,
  getUserAgreements,
  getAgreementById,
  updateAgreementStatus,
  signAgreement,
  updateAgreement,
  sendOtp,
  acceptAgreement
};