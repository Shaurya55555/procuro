const info = (message) => {
  console.log(`[${new Date().toISOString()}] INFO: ${message}`);
};

const warn = (message) => {
  console.warn(`[${new Date().toISOString()}] WARN: ${message}`);
};

const error = (message, err) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}${err ? ` - ${err.stack || err.message || err}` : ''}`);
};

const debug = (message) => {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[${new Date().toISOString()}] DEBUG: ${message}`);
  }
};

module.exports = { info, warn, error, debug };