const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');
const { requireApprovedVerification } = require('../middleware/verification');

router.use(authenticateToken, requireApprovedVerification);

// Routes with authentication
router.post('/send', messageController.sendMessage);
router.get('/conversation/:userId', messageController.getConversation);
router.get('/unread-count', messageController.getUnreadCount);
router.patch('/mark-read/:messageId', messageController.markAsRead);
router.post('/typing', messageController.setTyping);

module.exports = router;
