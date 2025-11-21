import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logging';

// Import database initialization
import { initializeDatabase } from './config/initializeDatabase';

// Import routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import researchRoutes from './routes/research';
import featureRoutes from './routes/features';
import uploadRoutes from './routes/uploads';
import exportRoutes from './routes/exports';
import wireframeRoutes from './routes/wireframes';
import prototypeRoutes from './routes/prototypes';
import prdRoutes from './routes/prds';
import validationRoutes from './routes/validation';
import healthRoutes from './routes/health';

// Initialize Express app
const app: Express = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // For development: allow any localhost port
    if (NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Gracefully reject the request instead of throwing an error
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use(morgan('combined'));
app.use(requestLogger);

// ============================================================================
// API ROUTES
// ============================================================================

// Root endpoint - API documentation
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Formative.AI Backend API',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV,
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      projects: '/api/v1/projects',
      research: '/api/v1/research',
      features: '/api/v1/features',
      uploads: '/api/v1/uploads',
      exports: '/api/v1/exports',
      wireframes: '/api/v1/wireframes',
      prototypes: '/api/v1/prototypes',
      prds: '/api/v1/prds',
      validation: '/api/v1/validation',
    },
    documentation: 'See README.md for full API documentation',
  });
});

// Health check endpoint
app.use('/health', healthRoutes);

// Authentication routes
app.use('/api/v1/auth', authRoutes);

// API v1 routes
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/research', researchRoutes);
app.use('/api/v1/features', featureRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/exports', exportRoutes);
app.use('/api/v1/wireframes', wireframeRoutes);
app.use('/api/v1/prototypes', prototypeRoutes);
app.use('/api/v1/prds', prdRoutes);
app.use('/api/v1/validation', validationRoutes);

// ============================================================================
// 404 HANDLER
// ============================================================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// ERROR HANDLER (Must be last)
// ============================================================================

app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database schema
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║         Formative.AI Backend - Server Started                  ║
║                                                                ║
║  Environment: ${NODE_ENV.padEnd(47)}║
║  Port:        ${PORT.toString().padEnd(47)}║
║  Time:        ${new Date().toISOString().padEnd(48)}║
╚════════════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
