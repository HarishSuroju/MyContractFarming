const express = require('express');
const {
  createAgreement,
  getUserAgreements,
  getAgreementById,
  updateAgreementStatus,
  signAgreement,
  updateAgreement,
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
  authorizeRoles('farmer'),
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