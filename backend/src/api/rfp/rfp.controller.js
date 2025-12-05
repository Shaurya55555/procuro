const rfpService = require('./rfp.service');
const { generateStructuredRfp } = require('../../utils/llm/generateRfp');
const { compareProposalsAi } = require('../../utils/llm/compare');

const createRfp = async (req, res) => {
  try {
    const rfp = await rfpService.createRfp(req.body);
    return res.status(201).json(rfp);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getRfpById = async (req, res) => {
  try {
    const rfpId = Number(req.params.id);
    if (Number.isNaN(rfpId)) {
      return res.status(400).json({ error: 'RFP id must be a number' });
    }

    const rfp = await rfpService.getRfpById(rfpId);
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    return res.json(rfp);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getAllRfps = async (req, res) => {
  try {
    const rfps = await rfpService.getAllRfps();
    return res.json(rfps);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const generateRfpFromText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Request body must include a 'text' field" });
    }

    const structured = await generateStructuredRfp(text);
    return res.json(structured);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const compareProposals = async (req, res) => {
  try {
    const rfpId = Number(req.params.id);
    if (Number.isNaN(rfpId)) {
      return res.status(400).json({ error: 'RFP id must be a number' });
    }

    const comparison = await compareProposalsAi(rfpId);
    return res.json(comparison);
  } catch (error) {
    if (error.message === 'RFP not found') {
      return res.status(404).json({ error: error.message });
    }

    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createRfp,
  getRfpById,
  getAllRfps,
  generateRfpFromText,
  compareProposals,
};
