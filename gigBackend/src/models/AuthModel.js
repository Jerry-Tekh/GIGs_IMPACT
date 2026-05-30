import pool from '../config/db.js';

export const createUser = async (user, client = pool) => {
  const { full_name, email, password, role } = user;

  const query = `
    INSERT INTO users (id, full_name, email, password, role)
    VALUES (gen_random_uuid(), $1, $2, $3, $4)
    RETURNING *;
  `;

  const result = await client.query(query, [
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
    `SELECT id, full_name, email, role, created_at, token_version, mfa_enabled
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

export const findSensitiveUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, full_name, email, password, role, created_at, token_version, mfa_enabled
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

export const recordFailedLoginAttempt = async (
  userId,
  maxAttempts = 5,
  lockMinutes = 30
) => {
  const result = await pool.query(
    `UPDATE users
     SET login_failed_attempts = COALESCE(login_failed_attempts, 0) + 1,
         account_locked = CASE
           WHEN COALESCE(login_failed_attempts, 0) + 1 >= $2 THEN true
           ELSE account_locked
         END,
         account_locked_until = CASE
           WHEN COALESCE(login_failed_attempts, 0) + 1 >= $2 THEN NOW() + ($3 * INTERVAL '1 minute')
           ELSE account_locked_until
         END
     WHERE id = $1
     RETURNING login_failed_attempts, account_locked, account_locked_until;`,
    [userId, maxAttempts, lockMinutes]
  );

  return result.rows[0] || null;
};

export const resetFailedLoginAttempts = async (userId) => {
  const result = await pool.query(
    `UPDATE users
     SET login_failed_attempts = 0,
         account_locked = false,
         account_locked_until = NULL
     WHERE id = $1
     RETURNING id;`,
    [userId]
  );

  return result.rows.length > 0;
};

export const setPasswordResetToken = async (email, resetTokenHash, resetTokenExpires) => {
  const result = await pool.query(
    `UPDATE users 
     SET reset_token = $1,
         reset_token_expires = $2,
         reset_code = NULL,
         reset_code_hash = NULL,
         reset_code_expires = NULL,
         reset_code_attempts = 0
     WHERE email = $3 
     RETURNING *;`,
    [resetTokenHash, resetTokenExpires, email]
  );

  return result.rows[0];
};

export const findUserByPasswordResetToken = async (tokenHash) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE reset_token = $1`,
    [tokenHash]
  );

  return result.rows[0];
};

export const clearPasswordResetToken = async (userId) => {
  const result = await pool.query(
    `UPDATE users
     SET reset_token = NULL,
         reset_token_expires = NULL,
         reset_code = NULL,
         reset_code_hash = NULL,
         reset_code_expires = NULL,
         reset_code_attempts = 0
     WHERE id = $1
     RETURNING id;`,
    [userId]
  );

  return result.rows.length > 0;
};

export const updatePassword = async (email, hashedPassword) => {
  const result = await pool.query(
    `UPDATE users 
     SET password = $1,
         reset_token = NULL,
         reset_token_expires = NULL,
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

export const updatePasswordAndInvalidateSessions = async (userId, email, hashedPassword) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const passwordResult = await client.query(
      `UPDATE users 
       SET password = $1,
           reset_token = NULL,
           reset_token_expires = NULL,
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

    await client.query(
      `UPDATE refresh_tokens
       SET revoked = true, revoked_at = NOW()
       WHERE user_id = $1 AND revoked = false;`,
      [userId]
    );

    await client.query(
      `UPDATE user_sessions
       SET is_active = false, logged_out_at = NOW()
       WHERE user_id = $1 AND is_active = true;`,
      [userId]
    );

    await incrementTokenVersion(userId, client);
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
 * Store email verification token for user
 */
export const setEmailVerificationToken = async (userId, verificationTokenHash, expiresAt, client = pool) => {
  const result = await client.query(
    `UPDATE users
     SET verification_token = $1,
         verification_token_expires = $2
     WHERE id = $3
     RETURNING id;`,
    [verificationTokenHash, expiresAt, userId]
  );

  return result.rows[0];
};

/**
 * Find user by verification token
 */
export const findUserByVerificationToken = async (tokenHash) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE verification_token = $1`,
    [tokenHash]
  );

  return result.rows[0];
};

/**
 * Mark email as verified
 */
export const markEmailAsVerified = async (userId) => {
  const result = await pool.query(
    `UPDATE users
     SET verified = true,
         verification_token = NULL,
         verification_token_expires = NULL
     WHERE id = $1
     RETURNING id, verified;`,
    [userId]
  );

  return result.rows[0];
};

export const updateUserProfile = async (userId, fullName) => {
  const result = await pool.query(
    `UPDATE users
     SET full_name = $1
     WHERE id = $2
     RETURNING id, full_name, email, role, created_at, token_version, mfa_enabled;`,
    [fullName, userId]
  );

  return result.rows[0] || null;
};
