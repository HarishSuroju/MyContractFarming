const Message = require('../models/Message');
const User = require('../models/User');

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        status: 'error',
        message: 'Receiver not found'
      });
    }

    // Create new message
    const message = new Message({
      senderId,
      receiverId,
      content,
      messageType: 'text'
    });

    await message.save();

    // Populate sender info for response
    await message.populate('senderId', 'name role profileImage');
    await message.populate('receiverId', 'name role profileImage');

    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get conversation history between two users
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params; // Other user's ID
    const currentUserId = req.user.id;

    // Mark messages as read
    await Message.updateMany(
      { 
        senderId: userId, 
        receiverId: currentUserId, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    // Get conversation messages
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    })
    .populate('senderId', 'name role profileImage')
    .populate('receiverId', 'name role profileImage')
    .sort({ createdAt: 1 });

    res.status(200).json({
      status: 'success',
      message: 'Conversation retrieved successfully',
      data: { messages }
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve conversation',
      error: error.message
    });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });

    res.status(200).json({
      status: 'success',
      message: 'Unread count retrieved successfully',
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve unread count',
      error: error.message
    });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOneAndUpdate(
      { _id: messageId, receiverId: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found or unauthorized'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Message marked as read',
      data: { message }
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

// Set typing status
exports.setTyping = async (req, res) => {
  try {
    const { receiverId, isTyping } = req.body;
    const senderId = req.user.id;

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        status: 'error',
        message: 'Receiver not found'
      });
    }

    // Update typing status in database
    await Message.updateMany(
      { senderId: senderId, receiverId: receiverId },
      { 
        isTyping: isTyping,
        typingTimeout: isTyping ? new Date(Date.now() + 5000) : null // 5 seconds timeout
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'Typing status updated',
      data: { isTyping }
    });
  } catch (error) {
    console.error('Error setting typing status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update typing status',
      error: error.message
    });
  }
};