import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import DatabaseService from './services/db.service.js';
import EnvironmentService from './services/env.service.js';
import { errorHandler, notFound } from './middleware/error.js';
import { requestLogger, errorLogger } from './middleware/logger.js';
import { securityMiddleware } from './middleware/security.js';

// Load environment variables
dotenv.config();

// Validate environment variables before starting
try {
  EnvironmentService.validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
}

// Import routes
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import studentRoutes from './routes/student.routes.js';
import aiRoutes from './routes/ai.routes.js';
import eventRoutes from './routes/events.routes.js';


const env = EnvironmentService.getEnvWithDefaults();
const app = express();
const PORT = env.port;

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Global error handlers for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Basic middleware
app.use(cors());
app.use(express.json());

// Logging middleware - should be early in the chain to log all requests
app.use(requestLogger);

// Apply security middleware
app.use(securityMiddleware);

// Initialize database
DatabaseService.initializeTables()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/events', eventRoutes);

// Serve static files in production
if (env.nodeEnv === 'production') {
  const distPath = join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

// Error handling middleware - should be last
app.use(notFound);
app.use(errorLogger); // Log errors before handling them
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  try {
    // Check database connection
    await DatabaseService.checkConnection();
    console.log('Database connection successful');
    console.log(`Server running in ${env.nodeEnv} mode on port ${PORT}`);
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
});

export default app;