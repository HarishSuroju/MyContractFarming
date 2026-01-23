const express = require('express');
const { createFarmerProfile, createContractorProfile, getProfile, getMatches, getAllUsers, getUserById } = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/', authenticateToken, getProfile);
router.post('/farmer', authenticateToken, createFarmerProfile);
router.post('/contractor', authenticateToken, createContractorProfile);
router.get('/match', authenticateToken, getMatches);

// Public route for user directory (no authentication required)
router.get('/all', getAllUsers);
router.get('/user/:userId', getUserById);

module.exports = router;