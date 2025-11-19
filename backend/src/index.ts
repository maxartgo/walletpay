import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { pool } from './config/database.js';
import { CronService } from './services/CronService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware - MUST BE FIRST
// Helmet.js: Sets secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for Web3 wallets
}));

// Rate Limiting: Prevent abuse and DDoS
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 auth attempts per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

const depositLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Max 20 deposits per hour
  message: 'Too many deposit requests, please try again later.',
});

// Apply rate limiters
app.use('/api', generalLimiter);
app.use('/api/admin/login', authLimiter);
app.use('/api/deposits', depositLimiter);
app.use('/api/investments', depositLimiter);
app.use('/api/withdrawals', depositLimiter);

// CORS
app.use(cors());

// Body Parser with size limits (prevent memory attacks)
app.use(express.json({ limit: '10mb' })); // Limit JSON body to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
      console.log(`🚀 WalletStake Backend Server`);
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
