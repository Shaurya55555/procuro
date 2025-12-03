require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });


const requiredVars = [
  'DATABASE_URL',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS',
  'IMAP_HOST', 'IMAP_PORT', 'IMAP_USER', 'IMAP_PASS',
  'LLM_API_KEY'
];

const missing = requiredVars.filter(key => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  IMAP_HOST: process.env.IMAP_HOST,
  IMAP_PORT: parseInt(process.env.IMAP_PORT, 10),
  IMAP_USER: process.env.IMAP_USER,
  IMAP_PASS: process.env.IMAP_PASS,
  LLM_API_KEY: process.env.LLM_API_KEY
};