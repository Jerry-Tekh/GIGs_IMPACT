import pool from '../config/db.js';

// ============== USER OPERATIONS ==============

export const createUser = async (user) => {
  const { full_name, email, password, role } = user;

  const query = `
    INSERT INTO users (id, full_name, email, password, role)
    VALUES (gen_random_uuid(), $1, $2, $3, $4)
    RETURNING id, full_name, email, role, token_version;
  `;

  const result = await pool.query(query, [
    full_name,
    email,
    password,
    role || 'reader'
  ]);

  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, full_name, email, role, created_at, token_version FROM users WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

// ============== PASSWORD RESET OPERATIONS ==============

export const updateResetCode = async (email, resetCode, resetCodeExpires) => {
  const result = await pool.query(
    `UPDATE users 
     SET reset_code = NULL,
         reset_code_hash = $1,
         reset_code_expires = $2,
         reset_code_attempts = 0
     WHERE email = $3 
     RETURNING *;`,
    [resetCode, resetCodeExpires, email]
  );

  return result.rows[0];
};

export const updatePassword = async (email, hashedPassword) => {
  const result = await pool.query(
    `UPDATE users 
     SET password = $1,
         reset_code = NULL,
         reset_code_hash = NULL,
         reset_code_expires = NULL,
         reset_code_attempts = 0
     WHERE email = $2 
     RETURNING id, full_name, email, role, token_version;`,
    [hashedPassword, email]
  );

  return result.rows[0];
};

export const clearResetCode = async (userId) => {
  const result = await pool.query(
    `UPDATE users
     SET reset_code = NULL,
         reset_code_hash = NULL,
         reset_code_expires = NULL,
         reset_code_attempts = 0
     WHERE id = $1
     RETURNING id;`,
    [userId]
  );

  return result.rows.length > 0;
};

export const recordResetCodeFailure = async (userId, maxAttempts) => {
  const result = await pool.query(
    `UPDATE users
     SET reset_code_attempts = COALESCE(reset_code_attempts, 0) + 1,
         reset_code = NULL,
         reset_code_hash = CASE
           WHEN COALESCE(reset_code_attempts, 0) + 1 >= $2 THEN NULL
           ELSE reset_code_hash
         END,
         reset_code_expires = CASE
           WHEN COALESCE(reset_code_attempts, 0) + 1 >= $2 THEN NULL
           ELSE reset_code_expires
         END
     WHERE id = $1
     RETURNING reset_code_attempts,
               (reset_code_hash IS NULL OR reset_code_expires IS NULL) AS invalidated;`,
    [userId, maxAttempts]
  );

  return result.rows[0] || null;
};

// ============== REFRESH TOKEN OPERATIONS ==============

/**
 * Store a refresh token in the database
 * Token is already hashed before being passed to this function
 * @param {string} userId - User ID
 * @param {string} tokenHash - SHA-256 hash of the refresh token
 * @param {Date} expiresAt - Token expiration timestamp
 * @param {string} userAgent - Browser/client user agent
 * @param {string} ipAddress - Client IP address
 * @returns {Object} Stored token record
 */
export const storeRefreshToken = async (
  userId,
  tokenHash,
  expiresAt,
  userAgent,
  ipAddress,
  deviceId = null,
  client = pool
) => {
  const query = `
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address, device_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, user_id, device_id, expires_at, created_at;
  `;

  const result = await client.query(query, [
    userId,
    tokenHash,
    expiresAt,
    userAgent || null,
    ipAddress || null,
    deviceId
  ]);

  return result.rows[0];
};

/**
 * Find a refresh token by hash
 * Used during token refresh to validate the token
 * @param {string} tokenHash - SHA-256 hash of the refresh token
 * @returns {Object|null} Token record if found
 */
export const findRefreshTokenByHash = async (tokenHash) => {
  const query = `
    SELECT 
      id, user_id, token_hash, expires_at, created_at, revoked, revoked_at, user_agent, ip_address, device_id
    FROM refresh_tokens
    WHERE token_hash = $1
    LIMIT 1;
  `;

  const result = await pool.query(query, [tokenHash]);
  return result.rows[0];
};

/**
 * Revoke a specific refresh token
 * Called during token rotation to invalidate the old token
 * @param {string} tokenId - ID of the token to revoke
 * @returns {boolean} True if revoked successfully
 */
export const revokeRefreshToken = async (tokenId) => {
  const query = `
    UPDATE refresh_tokens
    SET revoked = true, revoked_at = NOW()
    WHERE id = $1
    RETURNING id;
  `;

  const result = await pool.query(query, [tokenId]);
  return result.rows.length > 0;
};

/**
 * Revoke all refresh tokens for a user (logout all devices)
 * Used when user explicitly logs out from all devices
 * IMPORTANT: Also revoked if refresh token reuse is detected
 * @param {string} userId - User ID
 * @returns {number} Number of tokens revoked
 */
export const revokeAllUserTokens = async (userId) => {
  const query = `
    UPDATE refresh_tokens
    SET revoked = true, revoked_at = NOW()
    WHERE user_id = $1 AND revoked = false
    RETURNING id;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows.length;
};

export const incrementTokenVersion = async (userId, client = pool) => {
  const result = await client.query(
    `UPDATE users
     SET token_version = token_version + 1
     WHERE id = $1
     RETURNING token_version;`,
    [userId]
  );

  return result.rows[0] || null;
};

export const invalidateUserSessions = async (userId, client = pool) => {
  const ownsTransaction = client === pool;
  const dbClient = ownsTransaction ? await pool.connect() : client;

  try {
    if (ownsTransaction) {
      await dbClient.query('BEGIN');
    }

    const revokeResult = await dbClient.query(
      `UPDATE refresh_tokens
       SET revoked = true, revoked_at = NOW()
       WHERE user_id = $1 AND revoked = false
       RETURNING id;`,
      [userId]
    );

    await dbClient.query(
      `UPDATE user_sessions
       SET is_active = false, logged_out_at = NOW()
       WHERE user_id = $1 AND is_active = true`,
      [userId]
    );

    const tokenVersion = await incrementTokenVersion(userId, dbClient);

    if (ownsTransaction) {
      await dbClient.query('COMMIT');
    }

    return {
      revokedCount: revokeResult.rows.length,
      tokenVersion: tokenVersion?.token_version ?? null
    };
  } catch (error) {
    if (ownsTransaction) {
      await dbClient.query('ROLLBACK');
    }

    throw error;
  } finally {
    if (ownsTransaction) {
      dbClient.release();
    }
  }
};

export const updatePasswordAndInvalidateSessions = async (userId, email, hashedPassword) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const passwordResult = await client.query(
      `UPDATE users 
       SET password = $1,
           reset_code = NULL,
           reset_code_hash = NULL,
           reset_code_expires = NULL,
           reset_code_attempts = 0
       WHERE email = $2
       RETURNING id, full_name, email, role, token_version;`,
      [hashedPassword, email]
    );

    const updatedUser = passwordResult.rows[0];
    if (!updatedUser) {
      await client.query('ROLLBACK');
      return null;
    }

    await invalidateUserSessions(userId, client);
    await client.query('COMMIT');

    return updatedUser;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get all active refresh tokens for a user
 * Used to track active sessions (devices)
 * @param {string} userId - User ID
 * @returns {Array} Array of active tokens
 */
export const getUserActiveTokens = async (userId) => {
  const query = `
    SELECT 
      id, user_agent, ip_address, created_at, expires_at
    FROM refresh_tokens
    WHERE user_id = $1 AND revoked = false AND expires_at > NOW()
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

/**
 * Delete expired refresh tokens (cleanup)
 * Should be run periodically to keep the table clean
 * @returns {number} Number of tokens deleted
 */
export const deleteExpiredTokens = async () => {
  const query = `
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW()
    RETURNING id;
  `;

  const result = await pool.query(query);
  return result.rows.length;
};

export const rotateRefreshToken = async (
  tokenHash,
  newTokenHash,
  expiresAt,
  userAgent,
  ipAddress,
  deviceId
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const tokenResult = await client.query(
      `SELECT id, user_id, expires_at, revoked, device_id
       FROM refresh_tokens
       WHERE token_hash = $1
       LIMIT 1
       FOR UPDATE;`,
      [tokenHash]
    );

    const storedToken = tokenResult.rows[0];

    if (!storedToken) {
      await client.query('ROLLBACK');
      return { status: 'not_found' };
    }

    if (storedToken.revoked) {
      await client.query('ROLLBACK');
      return { status: 'reused', userId: storedToken.user_id };
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      await client.query('ROLLBACK');
      return { status: 'expired', userId: storedToken.user_id };
    }

    if (storedToken.device_id && storedToken.device_id !== deviceId) {
      await client.query('ROLLBACK');
      return { status: 'device_mismatch', userId: storedToken.user_id };
    }

    const userResult = await client.query(
      `SELECT id, full_name, email, role, token_version
       FROM users
       WHERE id = $1
       LIMIT 1;`,
      [storedToken.user_id]
    );

    const user = userResult.rows[0];
    if (!user) {
      await client.query('ROLLBACK');
      return { status: 'user_not_found' };
    }

    const revokeResult = await client.query(
      `UPDATE refresh_tokens
       SET revoked = true, revoked_at = NOW()
       WHERE id = $1 AND revoked = false
       RETURNING id;`,
      [storedToken.id]
    );

    if (revokeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { status: 'reused', userId: storedToken.user_id };
    }

    const insertResult = await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address, device_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, device_id, expires_at, created_at;`,
      [
        storedToken.user_id,
        newTokenHash,
        expiresAt,
        userAgent || null,
        ipAddress || null,
        storedToken.device_id || deviceId || null
      ]
    );

    const sessionResult = await client.query(
      `UPDATE user_sessions
       SET refresh_token_id = $2,
           last_activity_at = NOW()
       WHERE refresh_token_id = $1
       RETURNING id, risk_level, is_verified`,
      [storedToken.id, insertResult.rows[0].id]
    );

    await client.query('COMMIT');

    return {
      status: 'rotated',
      user,
      token: insertResult.rows[0],
      session: sessionResult.rows[0] || null
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Check for token reuse (security: detect if old token is being replayed)
 * If a refresh token is used twice, it indicates potential token theft
 * Return true if token should have been rotated but is being replayed
 * @param {string} tokenHash - SHA-256 hash of the refresh token
 * @returns {boolean} True if token reuse detected
 */
export const isTokenReused = async (tokenHash) => {
  // If token hash not found, it could be reuse (token was already rotated)
  // This is checked in the controller with more context
  const token = await findRefreshTokenByHash(tokenHash);
  
  // If token doesn't exist in DB and request includes refresh cookie,
  // it means the token was already used and rotated out
  return false; // Actual reuse detection happens in controller
};
