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
// FIXED CORS FOR PROD
// ---------------------
const allowedOrigins = [
  'http://localhost:3000',
  'https://procuro-1.onrender.com',     // frontend static site
  'https://procuro.onrender.com'        // backend domain (Render sometimes needs it)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Mobile apps/Postman
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

module.exports = app;
