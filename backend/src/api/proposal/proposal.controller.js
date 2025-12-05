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
    const rfpId = Number(req.params.rfpId);
    if (Number.isNaN(rfpId)) {
      return res.status(400).json({ error: 'rfpId must be a number' });
    }

    const proposals = await proposalService.getProposalsByRfpId(rfpId);
    res.json(proposals);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getProposalById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Proposal id must be a number' });
    }

    const proposal = await proposalService.getProposalById(id);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    res.json(proposal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const parseProposal = async (req, res) => {
  try {
    const { rawEmailText } = req.body || {};
    if (!rawEmailText) {
      return res.status(400).json({ error: "'rawEmailText' is required" });
    }

    const parsed = await proposalService.parseProposalEmail(rawEmailText);
    res.json(parsed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createProposal,
  getProposalsByRfpId,
  getProposalById,
  parseProposal,
};