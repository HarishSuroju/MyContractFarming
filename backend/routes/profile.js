const express = require('express');
const { createFarmerProfile, createContractorProfile, getProfile, getMatches, getAllUsers, getUserById } = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');
const { requireApprovedVerification } = require('../middleware/verification');

const router = express.Router();

// Protected routes
router.get('/', authenticateToken, getProfile);
router.post('/farmer', authenticateToken, createFarmerProfile);
router.post('/contractor', authenticateToken, createContractorProfile);
router.get('/match', authenticateToken, getMatches);

// Directory routes require verified account access
router.get('/all', authenticateToken, requireApprovedVerification, getAllUsers);
router.get('/user/:userId', authenticateToken, requireApprovedVerification, getUserById);

module.exports = router;
