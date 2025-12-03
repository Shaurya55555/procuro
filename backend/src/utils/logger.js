const info = (message) => {
  console.log(`[${new Date().toISOString()}] INFO: ${message}`);
};

const error = (message) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
};

module.exports = { info, error };