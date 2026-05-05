const db = require('../../db');

// Basic RFC-5322 inspired email regex for server-side validation
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createVendor = async (data) => {
  const { name, email, contact_person } = data;

  if (!name || typeof name !== 'string') {
    throw new Error('name is required');
  }

  if (!email || typeof email !== 'string') {
    throw new Error('email is required');
  }

  if (!EMAIL_RE.test(email.trim())) {
    throw new Error('email must be a valid email address');
  }

  const text = `
    INSERT INTO vendor (name, email, contact_person)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [name.trim(), email.trim(), contact_person ? contact_person.trim() : null];

  const res = await db.query(text, values);
  return res.rows[0];
};

const getAllVendors = async () => {
  const res = await db.query('SELECT * FROM vendor ORDER BY id ASC');
  return res.rows;
};

module.exports = {
  createVendor,
  getAllVendors
};