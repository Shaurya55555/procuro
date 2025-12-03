const { Pool } = require('pg');
const config = require('../config/env');

const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

// Test connection
pool.query('SELECT 1')
  .then(() => console.log('PostgreSQL connected successfully.'))
  .catch(err => console.error('Database connection error:', err));

// Handle unexpected PG socket errors
pool.on('error', (err) => {
  console.error('Unexpected PG client error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // IMPORTANT: export pool too
};
