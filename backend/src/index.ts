import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

// Routes
import candidateRoutes from './routes/candidates';
import recruiterRoutes from './routes/recruiters';
// import matchingRoutes from './routes/matching';
import callRoutes from './routes/calls';
import notificationRoutes from './routes/notifications';
import videoRoutes from './routes/video';

// Socket handlers
import { setupSocketHandlers } from './services/socketService';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HireMeNow Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/candidates', candidateRoutes);
app.use('/api/recruiters', recruiterRoutes);
// app.use('/api/matching', matchingRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/video', videoRoutes);

// Socket.IO setup
setupSocketHandlers(io);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 HireMeNow Backend running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export { app, io };
