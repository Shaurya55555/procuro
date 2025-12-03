const proposalService = require('./proposal.service');

const createProposal = async (req, res) => {
  try {
    const proposal = await proposalService.createProposal(req.body);
    res.status(201).json(proposal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getProposalsByRfpId = async (req, res) => {
  try {
    const proposals = await proposalService.getProposalsByRfpId(req.params.rfpId);
    res.json(proposals);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getProposalById = async (req, res) => {
  try {
    const proposal = await proposalService.getProposalById(req.params.id);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    res.json(proposal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createProposal,
  getProposalsByRfpId,
  getProposalById
};