require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const publicRoutes = require('./routes/public');
const staffRoutes = require('./routes/staff');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '20kb' }));

// Apply a basic request limit to API routes.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', publicRoutes);
app.use('/api/staff', staffRoutes);

// Serve frontend/index.html, styles.css, and app.js.
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Return safe JSON errors without exposing database details to visitors.
app.use((error, req, res, next) => {
  console.error('Request error:', error.message || error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    error: 'Something went wrong. Please try again.',
  });
});

app.listen(port, () => {
  console.log(`Appointment scheduler running at http://localhost:${port}`);
});