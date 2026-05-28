import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ipKeyGenerator } from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { verifyCSRFToken } from '../utils/generateCsrf.js';
import strict from 'assert/strict';

const getRateLimitKey = (req) => req.body?.email || ipKeyGenerator(req.ip);
const getContactEmailRateLimitKey = (req) => {
  const normalizedEmail = typeof req.body?.email === 'string'
    ? req.body.email.trim().toLowerCase()
    : '';

  return normalizedEmail || ipKeyGenerator(req.ip);
};
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const createRateLimitHandler = (defaultMessage) => (req, res) => {
  const resetTime = req.rateLimit?.resetTime;
  const retryAfterSeconds = resetTime
    ? Math.max(1, Math.ceil((new Date(resetTime).getTime() - Date.now()) / 1000))
    : Math.max(1, Math.ceil((req.rateLimit?.windowMs || 60_000) / 1000));

  res.setHeader('Retry-After', String(retryAfterSeconds));
  res.status(429).json({
    success: false,
    message: defaultMessage,
    retryAfterSeconds,
    retryAfter: retryAfterSeconds
  });
};

/**
 * HTTPS ENFORCEMENT MIDDLEWARE
 * Redirects HTTP to HTTPS in production
 * Production-ready implementation with proper header handling
 */
export const httpsEnforcer = (req, res, next) => {
  // Only enforce HTTPS in production
  if (process.env.NODE_ENV !== 'production') {
    next();
    return;
  }

  // Check if request is already HTTPS
  // req.secure works for direct HTTPS connections
  // X-Forwarded-Proto handles reverse proxies (Nginx, load balancers)
  const isSecure = req.secure || req.get('x-forwarded-proto') === 'https';

  if (!isSecure) {
    // Redirect HTTP to HTTPS
    const host = req.get('host'); // e.g., "example.com:3000"
    const url = req.originalUrl; // e.g., "/api/auth/login"
    const httpsUrl = `https://${host}${url}`;

    // 301 = Permanent redirect (for GET requests)
    // 307 = Temporary redirect (preserves HTTP method)
    return res.redirect(307, httpsUrl);
  }

  next();
};

const getAllowedOrigin = () => process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const matchesAllowedOrigin = (value, allowedOrigin) => value === allowedOrigin || value?.startsWith(`${allowedOrigin}/`);

/*
 * SECURITY MIDDLEWARE FACTORY
 * Production-grade security configurations
 */

/**
 * HELMET - Secure HTTP headers
 * Protects against common web vulnerabilities
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

/**
 * CORS CONFIGURATION
 * Restrict to specific origin
 */
export const corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigin = getAllowedOrigin();

    if (!origin || origin === allowedOrigin) {
      callback(null, true);
      return;
    }

    const error = new Error('Not allowed by CORS');
    error.statusCode = 403;
    callback(error);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  maxAge: 86400, // 24 hours
  
  
};

/**
 * REQUEST ID MIDDLEWARE
 * Adds unique request ID for logging and tracing
 */
export const requestIdMiddleware = (req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};

export const validateAllowedOrigin = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const allowedOrigin = getAllowedOrigin();
  const origin = req.get('origin');
  const referer = req.get('referer');

  if (!origin && !referer) {
    res.status(403).json({
      success: false,
      message: 'Forbidden - request origin missing'
    });
    return;
  }

  if (!matchesAllowedOrigin(origin, allowedOrigin) && !matchesAllowedOrigin(referer, allowedOrigin)) {
    res.status(403).json({
      success: false,
      message: 'Forbidden - invalid request origin'
    });
    return;
  }

  next();
};

export const csrfValidationMiddleware = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const token = req.get('x-csrf-token');
  const secret = req.cookies?.csrf_secret;

  if (!token || !secret) {
    res.status(403).json({
      success: false,
      message: 'CSRF token missing'
    });
    return;
  }

  if (!verifyCSRFToken(secret, token)) {
    res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
    return;
  }

  next();
};

/**
 * GENERAL RATE LIMITER
 * Applied to all routes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
   skipSuccessfulRequests: true, // Don't count successful requests
  handler: createRateLimitHandler('Too many requests. Please try again later.'),
  skip: (req) => {
    // Keep session recovery endpoints on their own limiter.
    return req.path === '/health' || req.path === '/api/auth/refresh';
  },
});


export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: getRateLimitKey,
  handler: createRateLimitHandler('Too many login attempts. Please try again after 15 minutes.')
});

export const refreshLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  standardHeaders: true,
  skipSuccessfulRequests: true, // Don't count successful logins
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  handler: createRateLimitHandler('Too many session refresh attempts. Please log in again shortly.')
});

/*
 * PASSWORD RESET RATE LIMITER
 * Prevent spam on password reset endpoint
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 12, // 12 reset requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getRateLimitKey,
  skipSuccessfulRequests: true, // Don't count successful logins

  handler: createRateLimitHandler('Too many password reset requests. Please try again later.')
});

export const verifyResetTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins

  keyGenerator: getRateLimitKey,
  handler: createRateLimitHandler('Too many reset link verification attempts. Please try again later.')
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
   skipSuccessfulRequests: true, 
  keyGenerator: getRateLimitKey,
  handler: createRateLimitHandler('Too many password reset attempts. Please try again later.')
});

export const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  standardHeaders: true,
   skipSuccessfulRequests: true, 
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  handler: createRateLimitHandler('Too many contact form submissions from this network. Please try again later.')
});

export const contactEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
   skipSuccessfulRequests: true, 
  legacyHeaders: false,
  keyGenerator: getContactEmailRateLimitKey,
  handler: createRateLimitHandler('Too many submissions were sent for this email address. Please try again later.')
});

export const mfaVerifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
 skipSuccessfulRequests: true, 
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.mfaSessionToken || ipKeyGenerator(req.ip),
  handler: createRateLimitHandler('Too many MFA verification attempts. Please try again later.')
});

/*
 * TRUSTED PROXY CONFIGURATION
 * Required for getting correct client IP behind proxy/load balancer
 */
export const trustProxyMiddleware = (app) => {
  // Trust X-Forwarded-For header from reverse proxy
  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
};

/**
 * SECURE COOKIE CONFIGURATION MIDDLEWARE
 * Sets Express cookie defaults for httpOnly, secure, and sameSite
 * Must be used before any cookies are set
 */
export const secureCookieMiddleware = (req, res, next) => {
  // Override res.cookie to enforce secure defaults
  const originalCookie = res.cookie.bind(res);

  res.cookie = function(name, value, options = {}) {
    const isProduction = process.env.NODE_ENV === 'production';

    // Secure defaults (can be overridden but must opt-out explicitly)
    const secureOptions = {
      httpOnly: options.httpOnly !== false, // Default: true (prevent XSS token theft)
      secure: options.secure !== false && isProduction, // Default: true in production (HTTPS only)
      sameSite: options.sameSite || 'strict', // Default: strict (prevent CSRF)
      ...options // Allow overrides if needed
    };

    // Log in development when cookies are set insecurely
    if (process.env.NODE_ENV === 'development' && !secureOptions.secure) {
      console.warn(`  Cookie '${name}' is being set without secure flag (development mode)`);
    }

    return originalCookie(name, value, secureOptions);
  };

  next();
};

/**
 * ERROR HANDLING MIDDLEWARE
 * Centralized error handler with security
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`[${req.id}] Error:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body is too large'
    });
  }

  // Don't leak internal error details to client
  const statusCode = err.statusCode || 500;
  const message = err.statusCode
    ? err.message
    : 'An unexpected error occurred. Please try again later.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
};

/**
 * NOT FOUND HANDLER
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
};
