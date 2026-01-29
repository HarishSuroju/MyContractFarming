const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');

// Routes with authentication
router.post('/send', authenticateToken, messageController.sendMessage);
router.get('/conversation/:userId', authenticateToken, messageController.getConversation);
router.get('/unread-count', authenticateToken, messageController.getUnreadCount);
router.patch('/mark-read/:messageId', authenticateToken, messageController.markAsRead);
router.post('/typing', authenticateToken, messageController.setTyping);

module.exports = router;