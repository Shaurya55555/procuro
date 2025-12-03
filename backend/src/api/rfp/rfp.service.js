const db = require('../../db');

const createRfp = async (data) => {
  const {
    title,
    description_raw,
    description_structured,
    budget,
    items,
    delivery_timeline,
    payment_terms,
    warranty
  } = data;

  if (!title) throw new Error("title is required");
  if (!items || !Array.isArray(items)) {
    throw new Error("items must be a non-empty array");
  }

  const query = `
    INSERT INTO rfp (
      title,
      description_raw,
      description_structured,
      budget,
      items,
      delivery_timeline,
      payment_terms,
      warranty
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [
    title,
    description_raw || null,
    description_structured || null,
    budget || null,
    items,                     // VALID ARRAY
    delivery_timeline || null,
    payment_terms || null,
    warranty || null
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

const getRfpById = async (id) => {
  const result = await db.query('SELECT * FROM rfp WHERE id = $1', [id]);
  return result.rows[0];
};

const getAllRfps = async () => {
  const result = await db.query('SELECT * FROM rfp ORDER BY id DESC');
  return result.rows;
};

module.exports = {
  createRfp,
  getRfpById,
  getAllRfps
};
