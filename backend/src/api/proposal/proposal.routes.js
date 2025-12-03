const express = require('express');
const router = express.Router();
const proposalController = require('./proposal.controller');

router.post('/', proposalController.createProposal);
router.get('/rfp/:rfpId', proposalController.getProposalsByRfpId);
router.get('/:id', proposalController.getProposalById);

module.exports = router;