import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { pool } from './config/database.js';
import { CronService } from './services/CronService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', routes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection test
async function testDatabaseConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected successfully');
    console.log('  Current time:', result.rows[0].now);
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

// Start server
async function start() {
  try {
    await testDatabaseConnection();

    // Start cron jobs
    CronService.startDailyYieldCalculation();

    app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 WalletPay Backend Server`);
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`�� Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API: http://localhost:${PORT}/api`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
