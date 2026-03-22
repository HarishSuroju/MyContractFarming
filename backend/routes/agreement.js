const express = require('express');
const {
  createAgreement,
  sendAgreement,
  sendAgreementToFarmer,
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
const { requireApprovedVerification } = require('../middleware/verification');

const router = express.Router();
router.use(authenticateToken, requireApprovedVerification);

// Agreement routes
router.post(
  '/',
  authorizeRoles('farmer', 'contractor'),
  createAgreement
);

// Send agreement to contractor
router.put(
  '/:agreementId/send',
  authorizeRoles('farmer'),
  sendAgreement
);

// Send agreement to farmer
router.put(
  '/:agreementId/send-to-farmer',
  authorizeRoles('contractor'),
  sendAgreementToFarmer
);

router.get(
  '/',
  authorizeRoles('farmer', 'contractor', 'admin'),
  getUserAgreements
);

router.get(
  '/:agreementId',
  authorizeRoles('farmer', 'contractor', 'admin'),
  getAgreementById
);

router.put(
  '/:agreementId',
  authorizeRoles('contractor'),
  updateAgreement
);

router.put(
  '/:agreementId/status',
  authorizeRoles('farmer', 'contractor'),
  updateAgreementStatus
);

router.put(
  '/:agreementId/sign',
  authorizeRoles('farmer', 'contractor'),
  signAgreement
);

router.post(
  '/:agreementId/send-otp',
  authorizeRoles('farmer'),
  sendOtp
);

router.post(
  '/:agreementId/accept',
  authorizeRoles('contractor'),
  acceptAgreement
);

// Mock payment workflow (contractor pays farmer)
router.post(
  '/:agreementId/payments/mock',
  authorizeRoles('contractor'),
  initiateMockPayment
);

// Rating submission after contract completion
router.post(
  '/:agreementId/rate',
  authorizeRoles('farmer', 'contractor'),
  submitRating
);

module.exports = router;
