const db = require('../../db');
const { parseProposal } = require('../../utils/llm/parseProposal');

const formatProposalRow = (row) => {
  if (!row) {
    return row;
  }

  const clone = { ...row };

  if (typeof clone.parsed === 'string') {
    try {
      clone.parsed = JSON.parse(clone.parsed);
    } catch (err) {
      clone.parsed = null;
    }
  }

  if (clone.parsed && typeof clone.parsed !== 'object') {
    clone.parsed = null;
  }

  return clone;
};

const getProposalById = async (id) => {
  const text = `
    SELECT p.*, v.name AS vendor_name, v.email AS vendor_email
    FROM proposal p
    JOIN vendor v ON v.id = p.vendor_id
    WHERE p.id = $1
  `;
  const res = await db.query(text, [Number(id)]);
  return formatProposalRow(res.rows[0]);
};

const createProposal = async (data) => {
  const { rfp_id, vendor_id, raw_email, parsed } = data;

  const normalizedRfpId = Number(rfp_id);
  const normalizedVendorId = Number(vendor_id);

  if (Number.isNaN(normalizedRfpId)) {
    throw new Error('rfp_id is required and must be a number');
  }

  if (Number.isNaN(normalizedVendorId)) {
    throw new Error('vendor_id is required and must be a number');
  }

  const normalizedRawEmail = typeof raw_email === 'string' ? raw_email : (raw_email ? String(raw_email) : null);
  const normalizedParsed = (typeof parsed === 'object' && parsed !== null) ? parsed : null;

  const text = `
    INSERT INTO proposal (rfp_id, vendor_id, raw_email, parsed)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [normalizedRfpId, normalizedVendorId, normalizedRawEmail, normalizedParsed];

  const res = await db.query(text, values);
  const created = res.rows[0];
  return getProposalById(created.id);
};

const getProposalsByRfpId = async (rfpId) => {
  const text = `
    SELECT p.*, v.name AS vendor_name, v.email AS vendor_email
    FROM proposal p
    JOIN vendor v ON v.id = p.vendor_id
    WHERE p.rfp_id = $1
    ORDER BY p.created_at DESC
  `;
  const res = await db.query(text, [Number(rfpId)]);
  return res.rows.map(formatProposalRow);
};

const parseProposalEmail = async (rawEmailText) => {
  return parseProposal(rawEmailText);
};

module.exports = {
  createProposal,
  getProposalsByRfpId,
  getProposalById,
  parseProposalEmail,
};