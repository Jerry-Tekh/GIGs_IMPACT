/**
 * Audit Logging Utility
 * Production-ready audit trail for security monitoring
 * 
 * Usage:
 *  await createAuditLog(req, user.id, 'LOGIN_SUCCESS', { ipAddress, device: 'mobile' });
 *  await createAuditLog(req, null, 'LOGIN_FAILED', { email, reason: 'invalid_credentials' });
 */

import pool from '../config/db.js';

/**
 * Extract client information from Express request
 * @param {Object} req - Express request object
 * @returns {Object} Client info with ipAddress and userAgent
 */
export const getClientInfo = (req) => {
  // IP address: check X-Forwarded-For (proxies/load balancers), then connection.remoteAddress
  const ipAddress = 
    req.get('x-forwarded-for')?.split(',')[0].trim() || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.ip ||
    'unknown';

  // User agent
  const userAgent = req.get('user-agent') || 'unknown';

  return {
    ipAddress,
    userAgent
  };
};

/**
 * Create audit log entry for security monitoring
 * Standard production-ready implementation
 * 
 * @param {Object} req - Express request object (REQUIRED - contains IP, User-Agent)
 * @param {number|null} userId - User ID (null for unauthenticated actions)
 * @param {string} action - Action type (LOGIN_SUCCESS, PASSWORD_CHANGED, etc.)
 * @param {Object} details - Additional context data
 * @param {string} status - 'success', 'failure', 'pending' (default: 'success')
 * @param {string} errorMessage - Error details if status is 'failure'
 * @returns {Promise<Object>} Audit log record
 */
export const createAuditLog = async (
  req,
  userId = null,
  action = 'UNKNOWN_ACTION',
  details = {},
  status = 'success',
  errorMessage = null
) => {
  try {
    // Validate input
    if (!req) {
      throw new Error('Request object (req) is required for audit logging');
    }

    if (!action || typeof action !== 'string') {
      throw new Error('Action must be a non-empty string');
    }

    // Extract client information from request
    const { ipAddress, userAgent } = getClientInfo(req);

    // Sanitize details (remove sensitive data)
    const sanitizedDetails = sanitizeDetails(details);

    // Insert into database
    const result = await pool.query(
      `INSERT INTO audit_logs 
       (user_id, action, ip_address, user_agent, details, status, error_message, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, created_at`,
      [userId, action, ipAddress, userAgent, JSON.stringify(sanitizedDetails), status, errorMessage]
    );

    const auditLog = result.rows[0];

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUDIT] ${action} | User: ${userId || 'anonymous'} | IP: ${ipAddress}`);
    }

    return auditLog;
  } catch (error) {
    // Log audit errors but don't crash the application
    console.error('❌ Audit logging error:', error.message);
    
    // In production, you might want to alert here
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send alert to monitoring service (Sentry, DataDog, etc.)
    }

    // Return null to allow application to continue
    // Audit logging should not break auth flows
    return null;
  }
};

/**
 * Sanitize details to remove sensitive information
 * Never log passwords, tokens, credit cards, etc.
 * @param {Object} details - Original details object
 * @returns {Object} Sanitized details
 */
const sanitizeDetails = (details) => {
  const sanitized = { ...details };

  // List of sensitive keys to exclude
  const sensitiveKeys = [
    'password',
    'passwordHash',
    'hashedPassword',
    'token',
    'refreshToken',
    'accessToken',
    'csrfToken',
    'creditCard',
    'cardNumber',
    'cvv',
    'ssn',
    'apiKey',
    'secret',
    'privateKey',
    'resetCode',
    'verificationCode',
    'mfaSecret',
    'otpSecret'
  ];

  // Remove sensitive fields (case-insensitive)
  sensitiveKeys.forEach(key => {
    Object.keys(sanitized).forEach(detailKey => {
      if (detailKey.toLowerCase().includes(key.toLowerCase())) {
        delete sanitized[detailKey];
      }
    });
  });

  return sanitized;
};

/**
 * Get audit logs for a specific user
 * @param {number} userId - User ID
 * @param {number} limit - Number of records to return (default: 50)
 * @param {number} offset - Pagination offset (default: 0)
 * @returns {Promise<Array>} Audit log records
 */
export const getUserAuditLogs = async (userId, limit = 50, offset = 0) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, action, ip_address, user_agent, details, status, created_at
       FROM audit_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  } catch (error) {
    console.error('Error retrieving audit logs:', error.message);
    throw error;
  }
};

/**
 * Get recent audit logs for security monitoring
 * Useful for admin dashboards
 * @param {number} limit - Number of records to return
 * @param {string} actionFilter - Filter by action (optional)
 * @returns {Promise<Array>} Recent audit log records
 */
export const getRecentAuditLogs = async (limit = 100, actionFilter = null) => {
  try {
    let query = `
      SELECT id, user_id, action, ip_address, user_agent, details, status, created_at
      FROM audit_logs
    `;
    const params = [];

    if (actionFilter) {
      query += `WHERE action = $1 `;
      params.push(actionFilter);
    }

    query += `ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving recent audit logs:', error.message);
    throw error;
  }
};

/**
 * Get audit logs for a specific IP address
 * Useful for detecting multiple failed logins from same IP
 * @param {string} ipAddress - IP address
 * @param {number} hoursBack - Look back this many hours (default: 24)
 * @returns {Promise<Array>} Audit logs from IP
 */
export const getAuditLogsByIP = async (ipAddress, hoursBack = 24) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, action, ip_address, user_agent, details, status, created_at
       FROM audit_logs
       WHERE ip_address = $1
       AND created_at > NOW() - INTERVAL '${hoursBack} hours'
       ORDER BY created_at DESC`,
      [ipAddress]
    );

    return result.rows;
  } catch (error) {
    console.error('Error retrieving audit logs by IP:', error.message);
    throw error;
  }
};

/**
 * Audit log action types (constants for consistency)
 */
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ANOMALY: 'LOGIN_ANOMALY',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGIN_FAILED_INVALID_CREDENTIALS: 'LOGIN_FAILED_INVALID_CREDENTIALS',
  LOGIN_FAILED_ACCOUNT_LOCKED: 'LOGIN_FAILED_ACCOUNT_LOCKED',
  LOGIN_FAILED_EMAIL_NOT_VERIFIED: 'LOGIN_FAILED_EMAIL_NOT_VERIFIED',
  LOGOUT: 'LOGOUT',
  
  // Registration
  SIGNUP_STARTED: 'SIGNUP_STARTED',
  SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
  SIGNUP_FAILED: 'SIGNUP_FAILED',
  
  // Email Verification
  EMAIL_VERIFICATION_SENT: 'EMAIL_VERIFICATION_SENT',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  EMAIL_VERIFICATION_FAILED: 'EMAIL_VERIFICATION_FAILED',
  
  // Password Management
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILED: 'PASSWORD_RESET_FAILED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_CHANGE_FAILED: 'PASSWORD_CHANGE_FAILED',
  
  // Token Management
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  TOKEN_ROTATION: 'TOKEN_ROTATION',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  TOKEN_REUSE_DETECTED: 'TOKEN_REUSE_DETECTED',
  
  // MFA
  MFA_ENABLED: 'MFA_ENABLED',
  MFA_DISABLED: 'MFA_DISABLED',
  MFA_SETUP_REQUIRED: 'MFA_SETUP_REQUIRED',
  MFA_CODE_GENERATED: 'MFA_CODE_GENERATED',
  MFA_VERIFICATION_PENDING: 'MFA_VERIFICATION_PENDING',
  MFA_VERIFICATION_SUCCESS: 'MFA_VERIFICATION_SUCCESS',
  MFA_VERIFICATION_FAILED: 'MFA_VERIFICATION_FAILED',
  
  // Account
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  ROLE_CHANGED: 'ROLE_CHANGED',
  PERMISSIONS_CHANGED: 'PERMISSIONS_CHANGED',
  
  // Security Events
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  ACCOUNT_COMPROMISED: 'ACCOUNT_COMPROMISED',
  IMPOSSIBLE_TRAVEL_DETECTED: 'IMPOSSIBLE_TRAVEL_DETECTED',
  NEW_DEVICE_LOGIN: 'NEW_DEVICE_LOGIN',
  CSRF_TOKEN_GENERATION: 'CSRF_TOKEN_GENERATION',
  CSRF_VALIDATION_FAILED: 'CSRF_VALIDATION_FAILED',
  
  // Administrative
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  ADMIN_ACTION: 'ADMIN_ACTION',
  DATA_EXPORT: 'DATA_EXPORT',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED'
};
