/**
 * AUDIT LOGGING INTEGRATION GUIDE
 * How to integrate the audit logging system into your AuthController
 * 
 * This file shows BEFORE and AFTER examples for each auth endpoint
 */

// ============================================================================
// IMPORTS (Add these to your AuthController.js)
// ============================================================================

import {
  createAuditLog,
  getClientInfo,
  getUserAuditLogs,
  AUDIT_ACTIONS
} from '../utils/auditLog.js';

// ============================================================================
// 1. LOGIN ENDPOINT
// ============================================================================

/* BEFORE:
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ... create tokens ...
    res.json({ success: true, message: 'Logged in successfully' });
  } catch (error) {
    // ...
  }
};
*/

// AFTER:
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      // Log failed login attempt (no user found)
      await createAuditLog(
        req,
        null,  // No user ID (user not found)
        AUDIT_ACTIONS.LOGIN_FAILED_INVALID_CREDENTIALS,
        { email, reason: 'user_not_found' },
        'failure'
      );

      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.account_locked && new Date(user.account_locked_until) > new Date()) {
      await createAuditLog(
        req,
        user.id,
        AUDIT_ACTIONS.LOGIN_FAILED_ACCOUNT_LOCKED,
        { email },
        'failure'
      );

      return res.status(429).json({
        message: 'Account locked due to multiple failed attempts. Try again later.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Log failed login attempt
      await createAuditLog(
        req,
        user.id,
        AUDIT_ACTIONS.LOGIN_FAILED_INVALID_CREDENTIALS,
        { email },
        'failure'
      );

      // Increment failed attempts
      user.login_failed_attempts = (user.login_failed_attempts || 0) + 1;

      if (user.login_failed_attempts >= 5) {
        // Lock account
        await pool.query(
          `UPDATE users SET account_locked = true, 
           account_locked_until = NOW() + INTERVAL '30 minutes',
           login_failed_attempts = $1
           WHERE id = $2`,
          [user.login_failed_attempts, user.id]
        );

        await createAuditLog(
          req,
          user.id,
          AUDIT_ACTIONS.ACCOUNT_LOCKED,
          { email, reason: 'too_many_failed_attempts' },
          'failure'
        );

        return res.status(429).json({
          message: 'Too many failed attempts. Account locked for 30 minutes.'
        });
      }

      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.verified) {
      await createAuditLog(
        req,
        user.id,
        AUDIT_ACTIONS.LOGIN_FAILED_EMAIL_NOT_VERIFIED,
        { email },
        'failure'
      );

      return res.status(403).json({
        message: 'Please verify your email first'
      });
    }

    // Reset failed attempts on successful login
    await pool.query(
      `UPDATE users SET login_failed_attempts = 0, account_locked = false, 
       account_locked_until = null, last_activity_at = NOW()
       WHERE id = $1`,
      [user.id]
    );

    // Create tokens
    const accessToken = generateAccessToken(user);
    const { tokenString: refreshToken, hashedToken } = generateRefreshToken();
    const tokenExpiry = getRefreshTokenExpiry();

    // Store refresh token
    await storeRefreshToken(user.id, hashedToken, tokenExpiry);

    // Set secure cookies
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: tokenExpiry
    });

    // Get client info for audit log
    const { ipAddress } = getClientInfo(req);

    // Log successful login
    await createAuditLog(
      req,
      user.id,
      AUDIT_ACTIONS.LOGIN_SUCCESS,
      {
        email: user.email,
        device: req.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop'
      },
      'success'
    );

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);

    // Log error
    await createAuditLog(
      req,
      null,
      AUDIT_ACTIONS.LOGIN_FAILED,
      { email },
      'failure',
      error.message
    );

    res.status(500).json({ message: 'Login failed' });
  }
};

// ============================================================================
// 2. REGISTER ENDPOINT
// ============================================================================

/* BEFORE:
export const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    // Validate input
    validateRegistrationInput(full_name, email, password);

    // Create user
    const newUser = await createUser(full_name, email, password);

    res.status(201).json({ success: true, message: 'Account created' });
  } catch (error) {
    // ...
  }
};
*/

// AFTER:
export const register = async (req, res) => {
  const { full_name, email, password } = req.body;

  try {
    // Validate input
    validateRegistrationInput(full_name, email, password);

    // Check if email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      await createAuditLog(
        req,
        null,
        AUDIT_ACTIONS.SIGNUP_FAILED,
        { email, reason: 'email_already_exists' },
        'failure'
      );

      return res.status(409).json({ message: 'Email already registered' });
    }

    // Log signup started
    await createAuditLog(
      req,
      null,
      AUDIT_ACTIONS.SIGNUP_STARTED,
      { email },
      'success'
    );

    // Create user (with verified: false)
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = hashToken(verificationToken);
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password, verified, verification_token, verification_token_expires)
       VALUES ($1, $2, $3, false, $4, $5)
       RETURNING id, email, full_name`,
      [full_name, email, hashedPassword, verificationTokenHash, verificationTokenExpires]
    );

    const newUser = result.rows[0];

    // Send verification email
    await transporter.sendMail({
      to: email,
      subject: 'Verify your GIGs Impact account',
      html: createEmailShell({
        title: 'Email Verification',
        subtitle: 'Verify your email to complete signup',
        body: `
          <p>Click the link below to verify your email:</p>
          <a href="${process.env.FRONTEND_URL}/verify/${verificationToken}">
            Verify Email
          </a>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This link expires in 24 hours.
          </p>
        `
      })
    });

    // Log successful signup
    await createAuditLog(
      req,
      newUser.id,
      AUDIT_ACTIONS.SIGNUP_SUCCESS,
      { email: newUser.email },
      'success'
    );

    res.status(201).json({
      success: true,
      message: 'Account created. Check your email to verify.'
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Log signup failure
    await createAuditLog(
      req,
      null,
      AUDIT_ACTIONS.SIGNUP_FAILED,
      { email },
      'failure',
      error.message
    );

    res.status(500).json({ message: 'Registration failed' });
  }
};

// ============================================================================
// 3. PASSWORD RESET ENDPOINT
// ============================================================================

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await findUserByEmail(email);

    // Log the attempt (don't reveal if email exists)
    await createAuditLog(
      req,
      null,
      AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED,
      { email: email || 'unknown' },
      'success'
    );

    // If user doesn't exist, don't reveal it
    if (!user) {
      return res.json({
        success: true,
        message: 'If email exists, reset code has been sent'
      });
    }

    // Generate reset code (longer and stronger)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashToken(resetToken);
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await setPasswordResetToken(user.id, resetTokenHash, resetTokenExpires);

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      to: email,
      subject: 'Reset your GIGs Impact password',
      html: createEmailShell({
        title: 'Password Reset',
        subtitle: 'Reset your account password',
        body: `
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">Reset Password</a>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
        `
      })
    });

    // Log successful reset request
    await createAuditLog(
      req,
      user.id,
      AUDIT_ACTIONS.PASSWORD_RESET_REQUESTED,
      { email },
      'success'
    );

    res.json({
      success: true,
      message: 'If email exists, reset code has been sent'
    });
  } catch (error) {
    console.error('Password reset request error:', error);

    await createAuditLog(
      req,
      null,
      AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
      { email },
      'failure',
      error.message
    );

    res.status(500).json({ message: 'Password reset failed' });
  }
};

export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    const resetTokenHash = hashToken(resetToken);
    const user = await findUserByPasswordResetToken(resetTokenHash);

    if (!user) {
      await createAuditLog(
        req,
        null,
        AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
        { reason: 'invalid_token' },
        'failure'
      );

      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    // Validate new password
    validatePassword(newPassword);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and invalidate all sessions
    await updatePasswordAndInvalidateSessions(user.id, hashedPassword);

    // Clear reset token
    await clearPasswordResetToken(user.id);

    // Log successful password reset
    await createAuditLog(
      req,
      user.id,
      AUDIT_ACTIONS.PASSWORD_CHANGED,
      { email: user.email, method: 'reset_token' },
      'success'
    );

    res.json({
      success: true,
      message: 'Password reset successfully. Please log in.'
    });
  } catch (error) {
    console.error('Password reset error:', error);

    await createAuditLog(
      req,
      null,
      AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
      { reason: error.message },
      'failure',
      error.message
    );

    res.status(500).json({ message: 'Password reset failed' });
  }
};

// ============================================================================
// 4. EMAIL VERIFICATION ENDPOINT
// ============================================================================

export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const tokenHash = hashToken(token);
    const user = await findUserByVerificationToken(tokenHash);

    if (!user || new Date(user.verification_token_expires) < new Date()) {
      await createAuditLog(
        req,
        null,
        AUDIT_ACTIONS.EMAIL_VERIFICATION_FAILED,
        { reason: 'invalid_or_expired_token' },
        'failure'
      );

      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    // Mark email as verified
    await markEmailAsVerified(user.id);

    // Log successful verification
    await createAuditLog(
      req,
      user.id,
      AUDIT_ACTIONS.EMAIL_VERIFIED,
      { email: user.email },
      'success'
    );

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    console.error('Email verification error:', error);

    await createAuditLog(
      req,
      null,
      AUDIT_ACTIONS.EMAIL_VERIFICATION_FAILED,
      { reason: error.message },
      'failure',
      error.message
    );

    res.status(500).json({ message: 'Email verification failed' });
  }
};

// ============================================================================
// 5. LOGOUT ENDPOINT
// ============================================================================

export const logout = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    // Invalidate refresh token
    if (req.cookies?.refreshToken) {
      const hashedToken = hashToken(req.cookies.refreshToken);
      await revokeRefreshToken(hashedToken);
    }

    // Log logout
    if (userId) {
      await createAuditLog(
        req,
        userId,
        AUDIT_ACTIONS.LOGOUT,
        { email: req.user.email },
        'success'
      );
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);

    res.status(500).json({ message: 'Logout failed' });
  }
};

// ============================================================================
// 6. GET AUDIT LOGS (for user to see their login history)
// ============================================================================

export const getMyAuditLogs = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { limit = 50, offset = 0 } = req.query;

    const auditLogs = await getUserAuditLogs(
      userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: auditLogs,
      count: auditLogs.length
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Failed to retrieve audit logs' });
  }
};

// ============================================================================
// ROUTE SETUP
// ============================================================================

/* Add these routes to your AuthRoutes.js:

import { 
  login, 
  register, 
  logout,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  getMyAuditLogs
} from '../controllers/AuthController.js';
import { protect } from '../middlewares/AuthMiddleware.js';

router.post('/login', login);
router.post('/register', register);
router.post('/logout', protect, logout);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/verify-email/:token', verifyEmail);
router.get('/audit-logs', protect, getMyAuditLogs);

export default router;
*/
