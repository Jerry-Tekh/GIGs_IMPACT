/**
 * AUTHOR ONLY MIDDLEWARE
 * Checks that user has 'author' role
 * Should be used AFTER protect middleware
 */
import { verifyAccessToken } from '../utils/tokenUtils.js';
import { findUserById } from '../models/AuthModel.js';
import pool from '../config/db.js';

export const authorOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
  if (req.user.role !== 'author') {
    return res.status(403).json({
      success: false,
      message: 'Authors only'
    });
  }
  next();
};

/*
 * READER ONLY MIDDLEWARE
 * Checks that user has 'reader' role
 * Should be used AFTER protect middleware
 */
export const readerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
  if (req.user.role !== 'reader') {
    return res.status(403).json({
      success: false,
      message: 'Readers only'
    });
  }
  next();
};

/**
 * PROTECT MIDDLEWARE
 * Verifies JWT access token from HTTP-only cookie
 * Attaches decoded user to req.user
 * Called on all protected routes
 */
export const protect = async (req, res, next) => {
  try {
    // Read access token from HTTP-only cookie
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Access token missing. Please login.'
      });
    }

    // Verify and decode token
    const decoded = verifyAccessToken(accessToken);

    const currentUser = await findUserById(decoded.user_id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if ((currentUser.token_version ?? 0) !== (decoded.token_version ?? 0)) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }

    // Attach user to request object for use in route handlers
    req.user = {
      user_id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
      token_version: currentUser.token_version,
      mfa_enabled: Boolean(currentUser.mfa_enabled)
    };

    if (decoded.session_id) {
      const sessionResult = await pool.query(
        `SELECT id, user_id, risk_level, is_verified, is_active, expires_at
         FROM user_sessions
         WHERE id = $1
         LIMIT 1`,
        [decoded.session_id]
      );

      const session = sessionResult.rows[0];
      if (!session || session.user_id !== currentUser.id || session.is_active === false) {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please login again.'
        });
      }

      if (session.expires_at && new Date(session.expires_at) < new Date()) {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please login again.'
        });
      }

      req.sessionId = session.id;
      req.session = {
        id: session.id,
        risk_level: session.risk_level,
        is_verified: session.is_verified
      };
    }

    next();

  } catch (error) {
    // Distinguish between expired and invalid tokens
    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Access token expired. Please refresh.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid access token'
    });
  }
};

/**
 * ADMIN ONLY MIDDLEWARE
 * Checks that user has 'admin' role
 * Should be used AFTER protect middleware
 */
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

export const requireVerifiedSession = (req, res, next) => {
  if (req.session?.risk_level === 'high' && !req.session?.is_verified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify this login before performing sensitive actions.',
      requiresSecurityVerification: true
    });
  }

  next();
};

export const requireMFAEnrollment = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  // Only enforce MFA enrollment for administrators. Authors/readers may opt-in voluntarily.
  if (req.user.role === 'admin' && !req.user.mfa_enabled) {
    return res.status(403).json({
      success: false,
      message: 'MFA setup is required for administrator accounts before accessing privileged routes.',
      requiresMFASetup: true
    });
  }

  next();
};
