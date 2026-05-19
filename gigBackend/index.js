import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { testDB } from './src/utils/testDB.js';

// Import security middleware
import {
  securityHeaders,
  corsConfig,
  requestIdMiddleware,
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  verifyResetTokenLimiter,
  resetPasswordLimiter,
  contactFormLimiter,
  contactEmailLimiter,
  trustProxyMiddleware,
  httpsEnforcer,
  secureCookieMiddleware,
  errorHandler,
  notFoundHandler,
} from './src/middlewares/securityMiddleware.js';

// Import routes
import postRoutes from './src/routes/postRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import authRoutes from './src/routes/AuthRoutes.js';
import securityRoutes from './src/routes/SecurityRoutes.js';
import adminRoutes from './src/routes/AdminRoutes.js';
import contactRoutes from './src/routes/ContactRoutes.js';
import userRoutes from './src/routes/UserRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';

// Initialize environment
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const defaultJsonParser = express.json({ limit: '100kb' });
const defaultUrlEncodedParser = express.urlencoded({ limit: '100kb', extended: true });
const authJsonParser = express.json({ limit: '50kb' });
const authUrlEncodedParser = express.urlencoded({ limit: '50kb', extended: true });
const contactJsonParser = express.json({ limit: '25kb' });
const contactUrlEncodedParser = express.urlencoded({ limit: '25kb', extended: true });
const postJsonParser = express.json({ limit: '5mb' });
const postUrlEncodedParser = express.urlencoded({ limit: '5mb', extended: true });

//  SECURITY MIDDLEWARE

// Trust proxy (for correct IP behind load balancer)
trustProxyMiddleware(app);

// HTTPS enforcement (redirect HTTP to HTTPS in production)
app.use(httpsEnforcer);

// Security headers (helmet)
app.use(securityHeaders);

// Secure cookie configuration
app.use(secureCookieMiddleware);

// CORS with credentials
app.use(cors(corsConfig));

// Request ID middleware (for logging/tracing)
app.use(requestIdMiddleware);

// ============== BODY PARSING ==============
app.use(cookieParser());
app.use('/api/auth', authJsonParser, authUrlEncodedParser);
app.use('/api/contact', contactJsonParser, contactUrlEncodedParser);
app.use('/api/posts', postJsonParser, postUrlEncodedParser);
app.use('/api/admin', postJsonParser, postUrlEncodedParser);
app.use('/api/security', defaultJsonParser, defaultUrlEncodedParser);
app.use('/api/users', defaultJsonParser, defaultUrlEncodedParser);
app.use('/api/uploads', defaultJsonParser, defaultUrlEncodedParser);
app.use(defaultJsonParser);
app.use(defaultUrlEncodedParser);

// ============== RATE LIMITING ==============
// General rate limiter (all routes)
app.use(generalLimiter);

// Auth-specific rate limiter
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/request-password-reset', passwordResetLimiter);
app.use('/api/auth/verify-reset-token', verifyResetTokenLimiter);
app.use('/api/auth/reset-password', resetPasswordLimiter);
app.use('/api/contact', contactFormLimiter);
app.use('/api/contact', contactEmailLimiter);

// ============== ROUTES ==============
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes); // Admin user management
app.use('/api/uploads', uploadRoutes);

// Health check endpoint (not rate limited)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============== ERROR HANDLING ==============
// 404 handler
app.use(notFoundHandler);

// Centralized error handler (must be last)
app.use(errorHandler);

// ============== SERVER STARTUP ==============
const startServer = async () => {
  try {
    // Test database connection
    await testDB();
    console.log('Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`

   GIGs Impact Backend                 
   Server running on port ${PORT}              
   Environment: ${process.env.NODE_ENV || 'development'}          ║

      `);
    });

  } catch (error) {
    console.error('✗ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
