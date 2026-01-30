const express = require('express');
const { 
  createNotification,
  getUserNotifications,
  getNotificationsDebug,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all notification routes
router.use(authenticateToken);

// Notification routes
router.post('/create', createNotification);
router.get('/debug', getNotificationsDebug);
router.get('/', getUserNotifications);
router.put('/:id/read', markNotificationAsRead);
router.put('/read-all', markAllNotificationsAsRead);
router.get('/unread-count', getUnreadCount);

module.exports = router;