const rfpService = require('./rfp.service');
const { generateStructuredRfp } = require('../../utils/llm/generateRfp');
const { compareProposalsAi } = require('../../utils/llm/compare');

const createRfp = async (req, res) => {
  try {
    const rfp = await rfpService.createRfp(req.body);
    res.status(201).json(rfp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getRfpById = async (req, res) => {
  try {
    const rfp = await rfpService.getRfpById(req.params.id);
    if (!rfp) return res.status(404).json({ error: 'RFP not found' });
    res.json(rfp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllRfps = async (req, res) => {
  try {
    const rfps = await rfpService.getAllRfps();
    res.json(rfps);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const generateRfpFromText = async (req, res) => {
  try {
    if (!req.body.text) {
      return res.status(400).json({ error: "Missing 'text' field" });
    }
    const structured = await generateStructuredRfp(req.body.text);
    res.json(structured);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const compareProposals = async (req, res) => {
  try {
    const result = await compareProposalsAi(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createRfp,
  getRfpById,
  getAllRfps,
  generateRfpFromText,
  compareProposals
};
