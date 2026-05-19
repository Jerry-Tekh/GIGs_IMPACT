import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * SECURITY NOTE: This module handles token generation and verification.
 * - Access tokens are short-lived JWTs stored in HTTP-only cookies
 * - Refresh tokens are cryptographically secure random strings (NOT JWTs)
 *   hashed with SHA-256 before storage to prevent token compromise during DB breaches
 */

/**
 * Generate a short-lived access token (15 minutes)
 * Contains user context for authorization decisions
 * @param {Object} user - User object with id, email, role
 * @returns {string} Signed JWT token
 * @throws {Error} If JWT_SECRET is not set
 */
export const generateAccessToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      role: user.role,
      token_version: user.token_version ?? 0,
      session_id: user.session_id ?? null,
      type: 'access',
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived for security
  );
};

/**
 * Generate a long-lived refresh token
 * Returns a secure random string that will be hashed before DB storage
 * @returns {string} 64-character hex string (32 bytes of entropy)
 */
export const generateRefreshToken = () => {
  // 32 bytes = 256 bits of entropy, sufficient for cryptographic use
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a refresh token using SHA-256
 * Refresh tokens are hashed before storage to prevent token compromise
 * if the database is breached (attacker gets hashed token, not usable as-is)
 * @param {string} token - The refresh token to hash
 * @returns {string} SHA-256 hash of the token
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Hash a password reset code before storing it in the database.
 * Uses a server-side secret so a DB leak alone is not enough to reuse codes.
 * @param {string} code - The one-time password reset code
 * @returns {string} HMAC-SHA256 hash of the reset code
 */
export const hashResetCode = (code) => {
  const secret = process.env.RESET_CODE_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('RESET_CODE_SECRET or JWT_SECRET must be configured');
  }

  return crypto.createHmac('sha256', secret).update(code).digest('hex');
};

/**
 * Verify and decode an access token
 * Called by middleware to validate requests
 * @param {string} token - The JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyAccessToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'access') {
      throw new Error('Invalid access token');
    }

    return decoded;
  } catch (error) {
    // Distinguish between expired and invalid tokens
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expired');
    }
    throw new Error('Invalid access token');
  }
};

/**
 * Verify refresh token exists and is not expired/revoked
 * Details are checked in the controller to provide better error messages
 * @param {Object} token - Token record from DB
 * @returns {boolean} True if token is valid
 */
export const isRefreshTokenValid = (token) => {
  if (!token) return false;
  if (token.revoked) return false;
  if (new Date(token.expires_at) < new Date()) return false;
  return true;
};

/**
 * Constants for token expiration times
 * Matches configuration used when storing tokens in DB
 */
export const TOKEN_EXPIRY = {
  // Access token: 15 minutes - short-lived to limit exposure
  ACCESS_TOKEN: 15 * 60,
  // Refresh token: 7 days - allows reasonable session duration
  REFRESH_TOKEN: 7 * 24 * 60 * 60,
};

/**
 * Calculate expiration timestamp for refresh token
 * @returns {Date} Expiration date based on TOKEN_EXPIRY.REFRESH_TOKEN
 */
export const getRefreshTokenExpiry = () => {
  const expirySeconds = TOKEN_EXPIRY.REFRESH_TOKEN;
  return new Date(Date.now() + expirySeconds * 1000);
};
