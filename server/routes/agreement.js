const express = require('express');
const { 
  createAgreement, 
  getUserAgreements, 
  updateAgreementStatus, 
  getAgreementById 
} = require('../controllers/agreementController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/', authenticateToken, createAgreement);
router.get('/', authenticateToken, getUserAgreements);
router.get('/:agreementId', authenticateToken, getAgreementById);
router.put('/:agreementId/status', authenticateToken, updateAgreementStatus);

module.exports = router;