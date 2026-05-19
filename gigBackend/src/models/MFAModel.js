import pool from '../config/db.js';

// ============= MFA SETUP =============

/**
 * Store temporary MFA secret (during setup)
 */
export const setMFATempSecret = async (userId, encryptedSecret, hashedBackupCodes = null) => {
  const result = await pool.query(
    `UPDATE users
     SET mfa_temp_secret_encrypted = $1,
         mfa_setup_started_at = NOW(),
         mfa_backup_codes_hashed = COALESCE($3, mfa_backup_codes_hashed)
     WHERE id = $2
     RETURNING id, mfa_enabled;`,
    [encryptedSecret, userId, hashedBackupCodes ? JSON.stringify(hashedBackupCodes) : null]
  );
  
  return result.rows[0];
};

/**
 * Get temporary MFA secret
 */
export const getMFATempSecret = async (userId) => {
  const result = await pool.query(
    `SELECT mfa_temp_secret_encrypted, mfa_setup_started_at, mfa_backup_codes_hashed
     FROM users
     WHERE id = $1;`,
    [userId]
  );
  
  return result.rows[0];
};

/**
 * Activate MFA (move temp secret to permanent)
 */
export const activateMFA = async (userId, encryptedSecret, hashedBackupCodes = null) => {
  const result = await pool.query(
    `UPDATE users
     SET mfa_enabled = true,
          mfa_secret_encrypted = $1,
         mfa_backup_codes_hashed = COALESCE($2, mfa_backup_codes_hashed),
         mfa_temp_secret_encrypted = NULL,
         mfa_setup_started_at = NULL,
         mfa_enabled_at = NOW()
     WHERE id = $3
     RETURNING id, mfa_enabled, mfa_enabled_at;`,
    [encryptedSecret, hashedBackupCodes ? JSON.stringify(hashedBackupCodes) : null, userId]
  );
  
  return result.rows[0];
};

/**
 * Disable MFA
 */
export const disableMFA = async (userId) => {
  const result = await pool.query(
    `UPDATE users
     SET mfa_enabled = false,
         mfa_secret_encrypted = NULL,
         mfa_backup_codes_hashed = NULL,
         mfa_temp_secret_encrypted = NULL,
         mfa_setup_started_at = NULL
     WHERE id = $1
     RETURNING id, mfa_enabled;`,
    [userId]
  );
  
  return result.rows[0];
};

// ============= MFA RETRIEVAL =============

/**
 * Check if user has MFA enabled
 */
export const hasMFAEnabled = async (userId) => {
  const result = await pool.query(
    `SELECT mfa_enabled FROM users WHERE id = $1;`,
    [userId]
  );
  
  return result.rows[0]?.mfa_enabled || false;
};

/**
 * Get user's MFA secret and backup codes
 */
export const getUserMFASecrets = async (userId) => {
  const result = await pool.query(
    `SELECT 
       mfa_secret_encrypted,
       mfa_backup_codes_hashed,
       mfa_enabled,
       mfa_enabled_at
     FROM users
     WHERE id = $1;`,
    [userId]
  );
  
  return result.rows[0];
};

export const updateUserMFABackupCodes = async (userId, backupCodesData) => {
  const result = await pool.query(
    `UPDATE users
     SET mfa_backup_codes_hashed = $1
     WHERE id = $2
     RETURNING id;`,
    [JSON.stringify(backupCodesData), userId]
  );

  return result.rows[0] || null;
};

// ============= MFA SESSIONS =============

/**
 * Create temporary MFA session
 * Used during login when user needs to verify MFA
 */
export const createMFASession = async (userId, sessionToken, expiresInMinutes = 5) => {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  
  const result = await pool.query(
    `INSERT INTO mfa_sessions (user_id, session_token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, session_token, expires_at;`,
    [userId, sessionToken, expiresAt]
  );
  
  return result.rows[0];
};

/**
 * Validate MFA session exists, is active, and not expired
 */
export const validateMFASession = async (sessionToken, userId = null) => {
  const params = [sessionToken];
  let userClause = '';

  if (userId) {
    params.push(userId);
    userClause = 'AND user_id = $2';
  }

  const result = await pool.query(
    `SELECT id, user_id, is_active, verified_at, expires_at
     FROM mfa_sessions
     WHERE session_token = $1
       ${userClause}
       AND is_active = true
       AND verified_at IS NULL
       AND expires_at > NOW();`,
    params
  );
  
  return result.rows[0] || null;
};

/**
 * Mark MFA session as verified
 */
export const markMFASessionVerified = async (sessionId) => {
  const result = await pool.query(
    `UPDATE mfa_sessions
     SET verified_at = NOW()
     WHERE id = $1
     RETURNING id, verified_at;`,
    [sessionId]
  );
  
  return result.rows[0];
};

/**
 * Invalidate MFA session
 */
export const invalidateMFASession = async (sessionId) => {
  const result = await pool.query(
    `UPDATE mfa_sessions
     SET is_active = false
     WHERE id = $1
     RETURNING id, is_active;`,
    [sessionId]
  );
  
  return result.rows[0];
};

export const invalidateAllUserMFASessions = async (userId) => {
  const result = await pool.query(
    `UPDATE mfa_sessions
     SET is_active = false
     WHERE user_id = $1 AND is_active = true
     RETURNING id;`,
    [userId]
  );

  return result.rows.length;
};

/**
 * Clean up expired MFA sessions
 */
export const cleanupExpiredMFASessions = async () => {
  const result = await pool.query(
    `UPDATE mfa_sessions
     SET is_active = false
     WHERE expires_at <= NOW() AND is_active = true
     RETURNING id;`
  );
  
  return result.rows.length;
};

// ============= BACKUP CODE USAGE =============

/**
 * Record backup code usage
 */
export const recordBackupCodeUsage = async (userId, codeIndex, ipAddress, userAgent) => {
  const result = await pool.query(
    `INSERT INTO mfa_backup_code_usage (user_id, code_index, ip_address, user_agent)
     VALUES ($1, $2, $3, $4)
     RETURNING id, used_at;`,
    [userId, codeIndex, ipAddress, userAgent]
  );
  
  return result.rows[0];
};

/**
 * Check if backup code was already used
 */
export const hasBackupCodeBeenUsed = async (userId, codeIndex) => {
  const result = await pool.query(
    `SELECT id FROM mfa_backup_code_usage
     WHERE user_id = $1 AND code_index = $2
     LIMIT 1;`,
    [userId, codeIndex]
  );
  
  return result.rows.length > 0;
};

// ============= MFA EVENTS =============

/**
 * Log MFA event for audit trail
 */
export const logMFAEvent = async (userId, eventType, ipAddress, userAgent, status = 'success', details = {}) => {
  const result = await pool.query(
    `INSERT INTO mfa_events (user_id, event_type, ip_address, user_agent, status, details)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, created_at;`,
    [userId, eventType, ipAddress, userAgent, status, JSON.stringify(details)]
  );
  
  return result.rows[0];
};

/**
 * Get recent MFA events for a user
 */
export const getUserMFAEvents = async (userId, limit = 20) => {
  const result = await pool.query(
    `SELECT id, event_type, status, ip_address, user_agent, details, created_at
     FROM mfa_events
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2;`,
    [userId, limit]
  );
  
  return result.rows;
};

/**
 * Count recent MFA verification failures (for rate limiting)
 */
export const countRecentMFAFailures = async (userId, withinMinutes = 15) => {
  const result = await pool.query(
    `SELECT COUNT(*) as failure_count
     FROM mfa_events
     WHERE user_id = $1
       AND status = 'failure'
       AND created_at > NOW() - ($2 || ' minutes')::INTERVAL;`,
    [userId, withinMinutes]
  );
  
  return parseInt(result.rows[0].failure_count) || 0;
};
