const express = require('express');
const {
  createAgreement,
  sendAgreement,
  getUserAgreements,
  getAgreementById,
  updateAgreement,
  updateAgreementStatus,
  signAgreement,
  sendOtp,
  acceptAgreement,
  initiateMockPayment,
  submitRating
} = require('../controllers/agreementController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Agreement routes
router.post(
  '/',
  authenticateToken,
  authorizeRoles('farmer', 'contractor'),
  createAgreement
);

// Send agreement to contractor
router.put(
  '/:agreementId/send',
  authenticateToken,
  authorizeRoles('farmer'),
  sendAgreement
);

router.get(
  '/',
  authenticateToken,
  authorizeRoles('farmer', 'contractor', 'admin'),
  getUserAgreements
);

router.get(
  '/:agreementId',
  authenticateToken,
  authorizeRoles('farmer', 'contractor', 'admin'),
  getAgreementById
);

router.put(
  '/:agreementId',
  authenticateToken,
  authorizeRoles('contractor'),
  updateAgreement
);

router.put(
  '/:agreementId/status',
  authenticateToken,
  authorizeRoles('farmer', 'contractor'),
  updateAgreementStatus
);

router.put(
  '/:agreementId/sign',
  authenticateToken,
  authorizeRoles('farmer', 'contractor'),
  signAgreement
);

router.post(
  '/:agreementId/send-otp',
  authenticateToken,
  authorizeRoles('farmer'),
  sendOtp
);

router.post(
  '/:agreementId/accept',
  authenticateToken,
  authorizeRoles('contractor'),
  acceptAgreement
);

// Mock payment workflow (contractor pays farmer)
router.post(
  '/:agreementId/payments/mock',
  authenticateToken,
  authorizeRoles('contractor'),
  initiateMockPayment
);

// Rating submission after contract completion
router.post(
  '/:agreementId/rate',
  authenticateToken,
  authorizeRoles('farmer', 'contractor'),
  submitRating
);

module.exports = router;