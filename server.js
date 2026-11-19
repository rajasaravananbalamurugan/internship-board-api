require('dotenv').config();
const createApp = require('./src/app');
const { getDatabase, closeDatabase } = require('./src/db/database');

const PORT = process.env.PORT || 3000;
const app = createApp();

// Ensure database connection and tables are ready
const db = getDatabase();

const server = app.listen(PORT, () => {
  console.log(`🚀 Internship Board API server is running on http://localhost:${PORT}`);
  console.log(`📋 API Documentation & Endpoints:`);
  console.log(`   - GET    http://localhost:${PORT}/api/health`);
  console.log(`   - GET    http://localhost:${PORT}/api/internships`);
  console.log(`   - GET    http://localhost:${PORT}/api/internships/:id`);
  console.log(`   - POST   http://localhost:${PORT}/api/internships`);
  console.log(`   - PUT    http://localhost:${PORT}/api/internships/:id`);
  console.log(`   - PATCH  http://localhost:${PORT}/api/internships/:id`);
  console.log(`   - DELETE http://localhost:${PORT}/api/internships/:id`);
  console.log(`🌐 Frontend UI accessible at http://localhost:${PORT}/`);
});

// Graceful shutdown handling
function handleShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    closeDatabase();
    console.log('Database connection closed. Process terminated.');
    process.exit(0);
  });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

module.exports = server;
