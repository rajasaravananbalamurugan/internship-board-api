const path = require('path');
const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health');
const internshipsRoutes = require('./routes/internships');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

/**
 * Creates and configures the Express application.
 */
function createApp() {
  const app = express();

  // Basic security and parsing middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
      });
      next();
    });
  }

  // Serve static frontend files from workspace root
  app.use(express.static(path.join(__dirname, '..')));

  // API Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/internships', internshipsRoutes);

  // Catch-all 404 handler for unmatched routes
  app.use(notFoundHandler);

  // Global centralized error handler
  app.use(globalErrorHandler);

  return app;
}

module.exports = createApp;
