const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');

// Try loading swagger.yml from /src first, then fallback to project root
let swaggerPath = path.join(__dirname, 'swagger.yml');
let swaggerDocument;

try {
  swaggerDocument = yaml.load(swaggerPath);
} catch (e) {
  swaggerPath = path.join(__dirname, '..', 'swagger.yml');
  swaggerDocument = yaml.load(swaggerPath);
}

const rfpRoutes = require('./api/rfp/rfp.routes');
const vendorRoutes = require('./api/vendor/vendor.routes');
const proposalRoutes = require('./api/proposal/proposal.routes');
const emailRoutes = require('./api/email/email.routes');

const app = express();

// ---------------------
// CORS
// ---------------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',         // Vite dev server
  'https://procuro-1.onrender.com',
  'https://procuro.onrender.com'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Mobile apps/Postman/curl
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root route
app.get('/', (req, res) => {
  res.send('Procuro backend is running');
});

// API routes
app.use('/rfp', rfpRoutes);
app.use('/vendors', vendorRoutes);
app.use('/proposals', proposalRoutes);
app.use('/email', emailRoutes);

// 404 handler — catches requests to unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler — catches errors thrown/passed from route handlers
// Must have 4 params for Express to recognise it as an error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error'
    : err.message || 'Internal server error';

  console.error(`[ERROR] ${req.method} ${req.path} — ${err.message}`);
  res.status(status).json({ error: message });
});

module.exports = app;
