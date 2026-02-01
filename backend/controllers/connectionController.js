const { User } = require('../models/User');
const { ConnectionRequest } = require('../models/ConnectionRequest');
const { Proposal } = require('../models/Proposal');

// Create a connection request
const createConnectionRequest = async (req, res) => {
  try {
    const { receiverId, cropType, season, landArea, expectedPrice, message, submittedAt, initiatedBy } = req.body;
    const senderId = req.user.userId;

    // Get sender and receiver details
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({
        status: 'error',
        message: 'Sender or receiver not found'
      });
    }

    // Check if a connection request already exists between these users
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({
        status: 'error',
        message: 'Connection request already exists'
      });
    }

    // Create new connection request
    const connectionRequest = new ConnectionRequest({
      senderId,
      receiverId,
      senderName: sender.name,
      receiverName: receiver.name,
      senderRole: sender.role,
      receiverRole: receiver.role,
      // Add detailed connection request fields if provided
      cropType,
      season,
      landArea,
      expectedPrice,
      message,
      submittedAt: submittedAt || Date.now(),
      initiatedBy: initiatedBy || 'unknown'
    });

    await connectionRequest.save();

    // Create notification for the receiver
    const { Notification } = require('../models/Notification');
    const notification = new Notification({
      userId: receiverId,
      senderId: senderId,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${sender.name} ${sender.role === 'farmer' ? 'Contractor' : 'Farmer'} wants to connect with you`,
      referenceId: connectionRequest._id,
      referenceType: 'connection_request'
    });

    await notification.save();

    // Emit real-time notification if receiver is online
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(receiverId.toString()).emit('notification:new', notification);
    }

    res.status(201).json({
      status: 'success',
      message: 'Connection request sent successfully',
      data: { request: connectionRequest }
    });
  } catch (error) {
    console.error('Create connection request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating connection request'
    });
  }
};

// Get connection request by ID
const getConnectionRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    const request = await ConnectionRequest.findOne({
      _id: requestId,
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    });

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Connection request not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Connection request fetched successfully',
      data: { request }
    });
  } catch (error) {
    console.error('Get connection request by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching connection request'
    });
  }
};

// Get all connection requests for the current user
const getUserConnectionRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await ConnectionRequest.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      message: 'Connection requests fetched successfully',
      data: { requests }
    });
  } catch (error) {
    console.error('Get connection requests error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching connection requests'
    });
  }
};

// Update connection request status
const updateConnectionRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be accepted or rejected'
      });
    }

    // Find the request and ensure the current user is the receiver
    const request = await ConnectionRequest.findOne({
      _id: requestId,
      receiverId: userId
    });

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Connection request not found or you are not authorized to update it'
      });
    }

    // Update status
    request.status = status;
    request.updatedAt = Date.now();
    await request.save();

    // Create notification for the sender
    const { Notification } = require('../models/Notification');
    const notification = new Notification({
      userId: request.senderId,
      senderId: userId,
      type: 'connection_request',
      title: 'Connection Request Updated',
      message: `Your connection request to ${request.receiverName} was ${status}`,
      referenceId: request._id,
      referenceType: 'connection_request'
    });

    await notification.save();

    // Emit real-time notification if sender is online
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(request.senderId.toString()).emit('notification:new', notification);
    }

    res.status(200).json({
      status: 'success',
      message: `Connection request ${status} successfully`,
      data: { request }
    });
  } catch (error) {
    console.error('Update connection request status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating connection request status'
    });
  }
};

// Create a proposal
const createProposal = async (req, res) => {
  try {
    const { receiverId, cropType, duration, salary, inputsSupplied, terms } = req.body;
    const senderId = req.user.userId;

    // Get sender and receiver details
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({
        status: 'error',
        message: 'Sender or receiver not found'
      });
    }

    // Create new proposal
    const proposal = new Proposal({
      senderId,
      receiverId,
      senderName: sender.name,
      receiverName: receiver.name,
      senderRole: sender.role,
      receiverRole: receiver.role,
      cropType,
      duration,
      salary,
      inputsSupplied: inputsSupplied || [],
      terms
    });

    await proposal.save();

    // Create notification for the receiver
    const { Notification } = require('../models/Notification');
    const notification = new Notification({
      userId: receiverId,
      senderId: senderId,
      type: 'interest_received',
      title: 'New Interest Received',
      message: `${sender.name} sent you an interest proposal`,
      referenceId: proposal._id,
      referenceType: 'proposal'
    });

    await notification.save();

    // Emit real-time notification if receiver is online
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(receiverId.toString()).emit('notification:new', notification);
    }

    res.status(201).json({
      status: 'success',
      message: 'Proposal created successfully',
      data: { proposal }
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating proposal'
    });
  }
};

// Get proposal by ID
const getProposalById = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const userId = req.user.userId;

    const proposal = await Proposal.findOne({
      _id: proposalId,
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    });

    if (!proposal) {
      return res.status(404).json({
        status: 'error',
        message: 'Proposal not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Proposal fetched successfully',
      data: { proposal }
    });
  } catch (error) {
    console.error('Get proposal by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching proposal'
    });
  }
};

// Get all proposals for the current user
const getUserProposals = async (req, res) => {
  try {
    const userId = req.user.userId;

    const proposals = await Proposal.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      message: 'Proposals fetched successfully',
      data: { proposals }
    });
  } catch (error) {
    console.error('Get proposals error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching proposals'
    });
  }
};

// Update proposal status
const updateProposalStatus = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Validate status
    if (!['accepted', 'rejected', 'needs_changes'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be accepted, rejected, or needs_changes'
      });
    }

    // Find the proposal and ensure the current user is the receiver
    const proposal = await Proposal.findOne({
      _id: proposalId,
      receiverId: userId
    });

    if (!proposal) {
      return res.status(404).json({
        status: 'error',
        message: 'Proposal not found or you are not authorized to update it'
      });
    }

    // Update status
    proposal.status = status;
    proposal.updatedAt = Date.now();
    await proposal.save();

    // Create notification for the sender
    const { Notification } = require('../models/Notification');
    const notification = new Notification({
      userId: proposal.senderId,
      senderId: userId,
      type: 'interest_received',
      title: 'Proposal Updated',
      message: `Your proposal to ${proposal.receiverName} was ${status}`,
      referenceId: proposal._id,
      referenceType: 'proposal'
    });

    await notification.save();

    // Emit real-time notification if sender is online
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(proposal.senderId.toString()).emit('notification:new', notification);
    }

    res.status(200).json({
      status: 'success',
      message: `Proposal ${status} successfully`,
      data: { proposal }
    });
  } catch (error) {
    console.error('Update proposal status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating proposal status'
    });
  }
};



// Cancel connection request (sender can cancel before receiver acts)
const cancelConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    const request = await ConnectionRequest.findOne({ _id: requestId });
    if (!request) {
      return res.status(404).json({ status: 'error', message: 'Connection request not found' });
    }

    // Only sender can cancel
    if (request.senderId !== userId) {
      return res.status(403).json({ status: 'error', message: 'Not authorized to cancel this request' });
    }

    // Remove the request
    await ConnectionRequest.findByIdAndDelete(requestId);

    // Notify receiver about cancellation
    const { Notification } = require('../models/Notification');
    const notification = new Notification({
      userId: request.receiverId,
      senderId: userId,
      type: 'connection_request',
      title: 'Connection Request Cancelled',
      message: `${request.senderName} has cancelled the connection request`,
      referenceId: request._id,
      referenceType: 'connection_request'
    });

    await notification.save();

    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      io.to(request.receiverId.toString()).emit('notification:new', notification);
    }

    res.status(200).json({ status: 'success', message: 'Connection request cancelled' });
  } catch (error) {
    console.error('Cancel connection request error:', error);
    res.status(500).json({ status: 'error', message: 'Server error while cancelling connection request' });
  }
};

module.exports = {
  createConnectionRequest,
  getConnectionRequestById,
  updateConnectionRequestStatus,
  getUserConnectionRequests,
  createProposal,
  getProposalById,
  updateProposalStatus,
  getUserProposals,
  cancelConnectionRequest
};