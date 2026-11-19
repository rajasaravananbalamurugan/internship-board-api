/**
 * Middleware for 404 Not Found errors on unmatched routes.
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

/**
 * Global error handling middleware for Express.
 */
function globalErrorHandler(err, req, res, next) {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle JSON parsing syntax errors (e.g. malformed JSON in request body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON payload received in request body'
    });
  }

  // Handle SQLite specific constraint errors
  if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || err.message?.includes('UNIQUE constraint failed')) {
    return res.status(409).json({
      status: 'error',
      message: 'A resource with this identifier already exists'
    });
  }

  // General server errors
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(isProduction ? {} : { stack: err.stack })
  });
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
