const express = require('express');
const { 
  createConnectionRequest,
  getConnectionRequestById,
  updateConnectionRequestStatus,
  getUserConnectionRequests,
  createProposal,
  getProposalById,
  updateProposalStatus,
  getUserProposals
} = require('../controllers/connectionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Connection Requests
router.post('/requests', authenticateToken, createConnectionRequest);
router.get('/requests/:requestId', authenticateToken, getConnectionRequestById);
router.patch('/requests/:requestId/status', authenticateToken, updateConnectionRequestStatus);
router.get('/requests', authenticateToken, getUserConnectionRequests);

// Proposals
router.post('/proposals', authenticateToken, createProposal);
router.get('/proposals/:proposalId', authenticateToken, getProposalById);
router.patch('/proposals/:proposalId/status', authenticateToken, updateProposalStatus);
router.get('/proposals', authenticateToken, getUserProposals);

module.exports = router;