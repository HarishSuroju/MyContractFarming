const { Notification } = require('../models/Notification');
const { User } = require('../models/User');

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { userId, senderId, type, title, message, referenceId, referenceType } = req.body;
    
    console.log('\n=== CREATE NOTIFICATION DEBUG INFO ===');
    console.log('Received userId:', userId);
    console.log('Received senderId:', senderId);
    console.log('Type:', type);
    console.log('Title:', title);
    console.log('Message:', message);
    console.log('ReferenceId:', referenceId);
    console.log('ReferenceType:', referenceType);

    const notification = new Notification({
      userId,
      senderId,
      type,
      title,
      message,
      referenceId,
      referenceType
    });

    console.log('Saving notification...');
    await notification.save();
    console.log('✓ Notification saved successfully with ID:', notification._id);

    // Emit real-time notification if socket.io is available
    if (req.app && req.app.get('io')) {
      const io = req.app.get('io');
      console.log('Socket.io available, emitting to room:', userId.toString());
      io.to(userId.toString()).emit('notification:new', notification);
      console.log('✓ Real-time notification emitted');
    } else {
      console.log('⚠ Socket.io not available on req.app');
    }

    res.status(201).json({
      status: 'success',
      message: 'Notification created successfully',
      data: { notification }
    });
  } catch (error) {
    console.error('=== CREATE NOTIFICATION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating notification'
    });
  }
};

// Get user's notifications
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    console.log('\n=== GET USER NOTIFICATIONS ===');
    console.log('Authenticated userId:', userId);
    console.log('Limit:', limit, 'Offset:', offset);

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('senderId', 'name email');

    console.log('✓ Found', notifications.length, 'notifications for user:', userId);
    if (notifications.length > 0) {
      console.log('Notification types:', notifications.map(n => n.type));
    }

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    console.log('Unread count:', unreadCount);

    res.status(200).json({
      status: 'success',
      data: { 
        notifications,
        unreadCount,
        total: notifications.length
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching notifications'
    });
  }
};

// Debug endpoint: Get detailed notifications info for current user
const getNotificationsDebug = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    console.log('\n=== DEBUG: GET NOTIFICATIONS DETAILED ===');
    console.log('Authenticated userId:', userId);

    // Get all notifications for this user
    const allNotifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name email role');

    console.log('Total notifications in DB for user:', allNotifications.length);

    // Get only unread notifications
    const unreadNotifications = await Notification.find({ userId, isRead: false })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name email role');

    console.log('Unread notifications:', unreadNotifications.length);

    // Breakdown by type
    const typeBreakdown = {};
    allNotifications.forEach(notif => {
      typeBreakdown[notif.type] = (typeBreakdown[notif.type] || 0) + 1;
    });

    console.log('Breakdown by type:', typeBreakdown);

    res.status(200).json({
      status: 'success',
      debug: {
        userId,
        totalNotifications: allNotifications.length,
        unreadCount: unreadNotifications.length,
        typeBreakdown,
        recentNotifications: allNotifications.slice(0, 10).map(n => ({
          _id: n._id,
          type: n.type,
          title: n.title,
          message: n.message,
          referenceType: n.referenceType,
          referenceId: n.referenceId,
          isRead: n.isRead,
          createdAt: n.createdAt,
          senderId: n.senderId
        }))
      },
      data: { 
        notifications: allNotifications,
        unreadCount: unreadNotifications.length
      }
    });
  } catch (error) {
    console.error('Debug get notifications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching debug info',
      error: error.message
    });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while marking notification as read'
    });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while marking all notifications as read'
    });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({
      status: 'success',
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching unread count'
    });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  getNotificationsDebug,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
};