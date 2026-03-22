const express = require('express');
const {
  createConnectionRequest,
  getConnectionRequestById,
  updateConnectionRequestStatus,
  getUserConnectionRequests,
  cancelConnectionRequest,
  createProposal,
  getProposalById,
  updateProposalStatus,
  getUserProposals
} = require('../controllers/connectionController');
const { authenticateToken } = require('../middleware/auth');
const { requireApprovedVerification } = require('../middleware/verification');

const router = express.Router();
router.use(authenticateToken, requireApprovedVerification);

// Connection Requests
router.post('/requests', createConnectionRequest);
router.get('/requests/:requestId', getConnectionRequestById);
router.patch('/requests/:requestId/status', updateConnectionRequestStatus);
router.delete('/requests/:requestId', cancelConnectionRequest);
router.get('/requests', getUserConnectionRequests);

// Proposals
router.post('/proposals', createProposal);
router.get('/proposals/:proposalId', getProposalById);
router.patch('/proposals/:proposalId/status', updateProposalStatus);
router.get('/proposals', getUserProposals);

module.exports = router;
