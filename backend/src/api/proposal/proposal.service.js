const db = require('../../db');

const createProposal = async (data) => {
  const { rfp_id, vendor_id, raw_email, parsed } = data;
  const text = `
    INSERT INTO proposal (rfp_id, vendor_id, raw_email, parsed)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [rfp_id, vendor_id, raw_email, parsed];
  
  const res = await db.query(text, values);
  return res.rows[0];
};

const getProposalsByRfpId = async (rfpId) => {
  const text = 'SELECT * FROM proposal WHERE rfp_id = $1 ORDER BY created_at DESC';
  const res = await db.query(text, [rfpId]);
  return res.rows;
};

const getProposalById = async (id) => {
  const text = 'SELECT * FROM proposal WHERE id = $1';
  const res = await db.query(text, [id]);
  return res.rows[0];
};

module.exports = {
  createProposal,
  getProposalsByRfpId,
  getProposalById
};