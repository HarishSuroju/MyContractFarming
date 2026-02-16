const express = require('express');
const { register, login, getProfile, updateProfileImage, forgotPassword, resetPassword, verifyOTP, resendOTP, sendOTP } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile/image', authenticateToken, updateProfileImage);

module.exports = router;
