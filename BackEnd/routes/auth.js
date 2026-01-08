const express = require('express');
const { registerUser, loginUser, getUserProfile, verifyOTP, resendOTP } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/profile', authenticateToken, getUserProfile);

module.exports = router;