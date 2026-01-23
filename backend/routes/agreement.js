const express = require('express');
const { 
  createAgreement, 
  getUserAgreements, 
  getAgreementById, 
  updateAgreementStatus,
  signAgreement,
  updateAgreement,
  sendOtp,
  acceptAgreement
} = require('../controllers/agreementController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Agreement routes
router.post('/', authenticateToken, createAgreement);
router.get('/', authenticateToken, getUserAgreements);
router.get('/:agreementId', authenticateToken, getAgreementById);
router.put('/:agreementId', authenticateToken, updateAgreement);
router.put('/:agreementId/status', authenticateToken, updateAgreementStatus);
router.put('/:agreementId/sign', authenticateToken, signAgreement);
router.post('/:agreementId/send-otp', authenticateToken, sendOtp);
router.post('/:agreementId/accept', authenticateToken, acceptAgreement);

module.exports = router;