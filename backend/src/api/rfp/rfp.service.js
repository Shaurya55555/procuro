const db = require('../../db');

const formatRfpRow = (row) => {
  if (!row) {
    return row;
  }

  const clone = { ...row };

  if (typeof clone.items === 'string') {
    try {
      clone.items = JSON.parse(clone.items);
    } catch (err) {
      clone.items = [];
    }
  }

  if (!Array.isArray(clone.items)) {
    clone.items = [];
  }

  if (typeof clone.description_structured === 'string') {
    try {
      clone.description_structured = JSON.parse(clone.description_structured);
    } catch (err) {
      clone.description_structured = {};
    }
  }

  if (clone.description_structured === null) {
    clone.description_structured = {};
  }

  if (clone.description_raw === null || clone.description_raw === undefined) {
    clone.description_raw = '';
  }

  if (clone.budget !== null && clone.budget !== undefined) {
    clone.budget = String(clone.budget);
  }

  return clone;
};

const createRfp = async (data) => {
  const {
    title,
    description_raw,
    description_structured,
    budget,
    items,
    delivery_timeline,
    payment_terms,
    warranty,
  } = data;

  if (!title || typeof title !== 'string') {
    throw new Error('title is required');
  }

  if (!Array.isArray(items) || !items.length) {
    throw new Error('items must be a non-empty array');
  }

  const normalisedItems = items.map((item) => (typeof item === 'string' ? item : String(item)));
  const structured = (typeof description_structured === 'object' && description_structured !== null)
    ? description_structured
    : {};
  const descriptionRawValue = description_raw === undefined || description_raw === null ? '' : String(description_raw);

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

  const budgetValue = budget === undefined || budget === null ? null : String(budget);

  const values = [
    title,
    descriptionRawValue,
    structured,
    budgetValue,
    normalisedItems,
    delivery_timeline ?? null,
    payment_terms ?? null,
    warranty ?? null,
  ];

  const result = await db.query(query, values);
  return formatRfpRow(result.rows[0]);
};

const getRfpById = async (id) => {
  const result = await db.query('SELECT * FROM rfp WHERE id = $1', [Number(id)]);
  return formatRfpRow(result.rows[0]);
};

const getAllRfps = async () => {
  const result = await db.query('SELECT * FROM rfp ORDER BY id DESC');
  return result.rows.map(formatRfpRow);
};

module.exports = {
  createRfp,
  getRfpById,
  getAllRfps,
};
