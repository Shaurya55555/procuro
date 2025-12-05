const db = require('../../db');

const createVendor = async (data) => {
  const { name, email } = data;

  if (!name || typeof name !== 'string') {
    throw new Error('name is required');
  }

  if (!email || typeof email !== 'string') {
    throw new Error('email is required');
  }

  const text = 'INSERT INTO vendor (name, email) VALUES ($1, $2) RETURNING *';
  const values = [name.trim(), email.trim()];
  
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