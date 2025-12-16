const express = require('express');
const { createFarmerProfile, createContractorProfile, getProfile } = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/', authenticateToken, getProfile);
router.post('/farmer', authenticateToken, createFarmerProfile);
router.post('/contractor', authenticateToken, createContractorProfile);

module.exports = router;