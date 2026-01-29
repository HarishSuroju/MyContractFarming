const { Agreement } = require('../models/Agreement');
const { User } = require('../models/User');
const { Notification } = require('../models/Notification');

// Create a new agreement between farmer and contractor
const createAgreement = async (req, res) => {
  try {
    console.log('=== CREATE AGREEMENT DEBUG INFO ===');
    console.log('Request body:', req.body);
    console.log('Authenticated user ID:', req.user?.userId);
    console.log('Authenticated user role:', req.user?.role);
    
    const { title, farmer, contractor, cropType, landArea, duration, salary, inputsSupplied, season, terms } = req.body;
    const userId = req.user.userId;

    console.log('Title:', title);
    console.log('Farmer ID:', farmer);
    console.log('Contractor ID:', contractor);
    console.log('Current user ID:', userId);

    // Verify that the current user is either the farmer or contractor
    if (userId !== farmer && userId !== contractor) {
      console.log('Authorization failed: Current user is not part of the agreement');
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to create this agreement'
      });
    }

    // Check if users exist
    console.log('Looking up farmer user...');
    const farmerUser = await User.findById(farmer);
    console.log('Farmer user found:', !!farmerUser);
    if (farmerUser) console.log('Farmer role:', farmerUser.role);

    console.log('Looking up contractor user...');
    const contractorUser = await User.findById(contractor);
    console.log('Contractor user found:', !!contractorUser);
    if (contractorUser) console.log('Contractor role:', contractorUser.role);

    if (!farmerUser || !contractorUser) {
      console.log('User lookup failed - farmer exists:', !!farmerUser, 'contractor exists:', !!contractorUser);
      return res.status(404).json({
        status: 'error',
        message: 'Farmer or contractor not found'
      });
    }

    if (farmerUser.role !== 'farmer' || contractorUser.role !== 'contractor') {
      console.log('Role validation failed - farmer role:', farmerUser.role, 'contractor role:', contractorUser.role);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user roles for agreement'
      });
    }

    // Create new agreement
    console.log('Creating agreement document...');
    const agreement = new Agreement({
      title,
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

    console.log('Saving agreement...');
    await agreement.save();
    console.log('Agreement saved successfully with ID:', agreement._id);

    // Create notification for the other party
    const otherUserId = userId === farmer ? contractor : farmer;
    const senderName = farmerUser._id.toString() === userId ? farmerUser.name : contractorUser.name;
    
    const notification = new Notification({
      userId: otherUserId,
      senderId: userId,
      type: 'agreement_sent',
      title: 'New Agreement Received',
      message: `${senderName} has sent you a new agreement for ${cropType}.`,
      referenceId: agreement._id,
      referenceType: 'agreement'
    });

    await notification.save();

    // Emit real-time notification if user is online
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(otherUserId.toString()).emit('notification:new', notification);
    }

    res.status(201).json({
      status: 'success',
      message: 'Agreement created successfully',
      data: { agreement }
    });
  } catch (error) {
    console.error('=== CREATE AGREEMENT ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    console.error('Request body at time of error:', req.body);
    console.error('Authenticated user:', req.user);
    
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating agreement: ' + error.message
    });
  }
};

// Send agreement to contractor (change status to sent_to_contractor)
const sendAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const userId = req.user.userId;

    const agreement = await Agreement.findById(agreementId).populate('farmer contractor');
    
    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Only the farmer can send the agreement
    if (agreement.farmer._id.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the farmer can send this agreement'
      });
    }

    // Update status to sent_to_contractor
    agreement.status = 'sent_to_contractor';
    await agreement.save();

    // Create notification for contractor
    const notification = new Notification({
      userId: agreement.contractor._id.toString(),
      senderId: userId,
      type: 'agreement_sent',
      title: 'New Agreement Received',
      message: `${agreement.farmer.name} has sent you an agreement for ${agreement.cropType}.`,
      referenceId: agreement._id,
      referenceType: 'agreement'
    });

    await notification.save();

    // Emit real-time notification
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(agreement.contractor._id.toString()).emit('notification:new', notification);
    }

    res.status(200).json({
      status: 'success',
      message: 'Agreement sent successfully',
      data: { agreement }
    });
  } catch (error) {
    console.error('Send agreement error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while sending agreement'
    });
  }
};

// Get user agreements
const getUserAgreements = async (req, res) => {
  try {
    const userId = req.user.userId;

    const agreements = await Agreement.find({
      $or: [
        { farmer: userId },
        { contractor: userId }
      ]
    })
    .populate('farmer contractor')
    .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
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

// Get agreement by ID
const getAgreementById = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const userId = req.user.userId;

    const agreement = await Agreement.findById(agreementId).populate('farmer contractor');

    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Check if user has access to this agreement
    if (agreement.farmer._id.toString() !== userId && agreement.contractor._id.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have access to this agreement'
      });
    }

    res.status(200).json({
      status: 'success',
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

// Update agreement
const updateAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    const agreement = await Agreement.findById(agreementId).populate('farmer contractor');

    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Only the contractor can edit the agreement when it's in sent_to_contractor status
    if (agreement.contractor._id.toString() !== userId || agreement.status !== 'sent_to_contractor') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to edit this agreement'
      });
    }

    // Update agreement fields
    Object.keys(updateData).forEach(key => {
      if (agreement[key] !== undefined) {
        agreement[key] = updateData[key];
      }
    });

    await agreement.save();

    // Create notification for farmer
    const notification = new Notification({
      userId: agreement.farmer._id.toString(),
      senderId: userId,
      type: 'agreement_edited',
      title: 'Agreement Edited',
      message: `${agreement.contractor.name} has edited the agreement for ${agreement.cropType}.`,
      referenceId: agreement._id,
      referenceType: 'agreement'
    });

    await notification.save();

    // Emit real-time notification
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(agreement.farmer._id.toString()).emit('notification:new', notification);
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

// Update agreement status
const updateAgreementStatus = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const agreement = await Agreement.findById(agreementId).populate('farmer contractor');

    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    let validStatusTransition = false;
    let recipientUserId = null;
    let notificationType = '';
    let notificationMessage = '';

    // Define valid status transitions and recipients
    if (agreement.farmer._id.toString() === userId) {
      // Farmer actions
      if (status === 'agreement_confirmed' && agreement.status === 'accepted_by_contractor') {
        validStatusTransition = true;
        recipientUserId = agreement.contractor._id.toString();
        notificationType = 'agreement_confirmed';
        notificationMessage = `${agreement.farmer.name} has confirmed the agreement for ${agreement.cropType}.`;
      } else if (status === 'agreement_rejected' && agreement.status === 'accepted_by_contractor') {
        validStatusTransition = true;
        recipientUserId = agreement.contractor._id.toString();
        notificationType = 'agreement_rejected';
        notificationMessage = `${agreement.farmer.name} has rejected the agreement for ${agreement.cropType}.`;
      }
    } else if (agreement.contractor._id.toString() === userId) {
      // Contractor actions
      if (status === 'accepted_by_contractor' && agreement.status === 'sent_to_contractor') {
        validStatusTransition = true;
        recipientUserId = agreement.farmer._id.toString();
        notificationType = 'agreement_accepted';
        notificationMessage = `${agreement.contractor.name} has accepted the agreement for ${agreement.cropType}.`;
      } else if (status === 'rejected_by_contractor' && agreement.status === 'sent_to_contractor') {
        validStatusTransition = true;
        recipientUserId = agreement.farmer._id.toString();
        notificationType = 'agreement_rejected';
        notificationMessage = `${agreement.contractor.name} has rejected the agreement for ${agreement.cropType}.`;
      } else if (status === 'edited_by_contractor' && agreement.status === 'sent_to_contractor') {
        validStatusTransition = true;
        recipientUserId = agreement.farmer._id.toString();
        notificationType = 'agreement_edited';
        notificationMessage = `${agreement.contractor.name} has edited the agreement for ${agreement.cropType}.`;
      }
    }

    if (!validStatusTransition) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status transition'
      });
    }

    // Update status
    agreement.status = status;
    if (status === 'agreement_confirmed' || status === 'accepted_by_contractor') {
      agreement.acceptedAt = new Date();
    }
    await agreement.save();

    // Create notification for the other party
    const notification = new Notification({
      userId: recipientUserId,
      senderId: userId,
      type: notificationType,
      title: 'Agreement Status Updated',
      message: notificationMessage,
      referenceId: agreement._id,
      referenceType: 'agreement'
    });

    await notification.save();

    // Emit real-time notification
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(recipientUserId).emit('notification:new', notification);
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

// Sign agreement
const signAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const userId = req.user.userId;
    const { signatureType } = req.body; // 'farmer' or 'contractor'

    const agreement = await Agreement.findById(agreementId).populate('farmer contractor');

    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Check if user can sign
    if ((signatureType === 'farmer' && agreement.farmer._id.toString() !== userId) ||
        (signatureType === 'contractor' && agreement.contractor._id.toString() !== userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to sign this agreement'
      });
    }

    // Update signature
    if (signatureType === 'farmer') {
      agreement.farmerSignature = true;
    } else if (signatureType === 'contractor') {
      agreement.contractorSignature = true;
    }

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

// Send OTP for agreement confirmation
const sendOtp = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const userId = req.user.userId;

    const agreement = await Agreement.findById(agreementId).populate('farmer contractor');

    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Only farmer can send OTP
    if (agreement.farmer._id.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the farmer can send OTP for this agreement'
      });
    }

    // Generate and save OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    agreement.otp = otp;
    agreement.otpGeneratedAt = new Date();
    await agreement.save();

    // In a real app, this would send the OTP via SMS/email
    // For now, we'll just return it
    res.status(200).json({
      status: 'success',
      message: 'OTP generated and sent',
      data: { otp: 'OTP_HIDDEN_FOR_SECURITY' } // Don't expose actual OTP in production
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while sending OTP'
    });
  }
};

// Accept agreement with OTP
const acceptAgreement = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { otp } = req.body;
    const userId = req.user.userId;

    const agreement = await Agreement.findById(agreementId).populate('farmer contractor');

    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Only contractor can accept with OTP
    if (agreement.contractor._id.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the contractor can accept this agreement'
      });
    }

    // Verify OTP
    if (!agreement.otp || agreement.otp !== otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired OTP'
      });
    }

    // Update status to active
    agreement.status = 'active';
    agreement.acceptedAt = new Date();
    agreement.otp = undefined; // Clear OTP after use
    agreement.otpGeneratedAt = undefined;
    await agreement.save();

    // Create notification for farmer
    const notification = new Notification({
      userId: agreement.farmer._id.toString(),
      senderId: userId,
      type: 'agreement_accepted',
      title: 'Agreement Activated',
      message: `${agreement.contractor.name} has activated the agreement for ${agreement.cropType}.`,
      referenceId: agreement._id,
      referenceType: 'agreement'
    });

    await notification.save();

    // Emit real-time notification
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(agreement.farmer._id.toString()).emit('notification:new', notification);
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

// Initiate mock payment
const initiateMockPayment = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const userId = req.user.userId;

    const agreement = await Agreement.findById(agreementId).populate('farmer contractor');

    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Only contractor can initiate payment
    if (agreement.contractor._id.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the contractor can initiate payment for this agreement'
      });
    }

    // Update payment status
    agreement.paymentStatus = 'paid';
    agreement.lastPaymentAt = new Date();
    await agreement.save();

    // Create notification for farmer
    const notification = new Notification({
      userId: agreement.farmer._id.toString(),
      senderId: userId,
      type: 'payment_update',
      title: 'Payment Completed',
      message: `Payment for agreement on ${agreement.cropType} has been completed.`,
      referenceId: agreement._id,
      referenceType: 'agreement'
    });

    await notification.save();

    // Emit real-time notification
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(agreement.farmer._id.toString()).emit('notification:new', notification);
    }

    res.status(200).json({
      status: 'success',
      message: 'Payment initiated successfully',
      data: { agreement }
    });
  } catch (error) {
    console.error('Initiate mock payment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while initiating payment'
    });
  }
};

// Submit rating after agreement completion
const submitRating = async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.userId;

    const agreement = await Agreement.findById(agreementId).populate('farmer contractor');

    if (!agreement) {
      return res.status(404).json({
        status: 'error',
        message: 'Agreement not found'
      });
    }

    // Determine which rating to update based on user
    if (agreement.farmer._id.toString() === userId) {
      // Farmer rating the contractor
      agreement.contractorRating = rating;
      agreement.contractorReview = review;
    } else if (agreement.contractor._id.toString() === userId) {
      // Contractor rating the farmer
      agreement.farmerRating = rating;
      agreement.farmerReview = review;
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'You are not part of this agreement'
      });
    }

    await agreement.save();

    res.status(200).json({
      status: 'success',
      message: 'Rating submitted successfully',
      data: { agreement }
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while submitting rating'
    });
  }
};

module.exports = {
  createAgreement,
  sendAgreement,
  getUserAgreements,
  getAgreementById,
  updateAgreement,
  updateAgreementStatus,
  signAgreement,
  sendOtp,
  acceptAgreement,
  initiateMockPayment,
  submitRating
};