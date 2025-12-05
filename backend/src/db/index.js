const { Pool } = require('pg');
const config = require('../config/env');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

pool
  .query('SELECT 1')
  .then(() => {
    logger.info('PostgreSQL connected successfully');
  })
  .catch((error) => {
    logger.error(`Database connection error: ${error.message}`);
    throw error;
  });

pool.on('error', (error) => {
  logger.error(`Unexpected PostgreSQL client error: ${error.message}`);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
