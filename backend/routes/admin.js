const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  getAllUsers,
  verifyUser,
  blockUser,
  getAllAgreements,
  approveAgreement,
  getPayments,
  getFraudAlerts,
  getAnalytics
} = require('../controllers/adminController');

// Apply authentication middleware to all admin routes
router.use(authenticateToken);

// User management routes
router.get('/users', adminOnly, getAllUsers);
router.put('/users/:id/verify', adminOnly, verifyUser);
router.put('/users/:id/block', adminOnly, blockUser);

// Agreement management routes
router.get('/agreements', adminOnly, getAllAgreements);
router.put('/agreements/:id/approve', adminOnly, approveAgreement);

// Payment monitoring routes
router.get('/payments', adminOnly, getPayments);

// Fraud alerts routes
router.get('/fraud', adminOnly, getFraudAlerts);

// Analytics routes
router.get('/analytics', adminOnly, getAnalytics);

module.exports = router;