import bcrypt from 'bcrypt';
import crypto from "crypto";
import {
  validatePassword,
  validateFullName,
  validateEmail,
  validateRegistrationInput
} from '../utils/validateInput.js';

import {
  createUser,
  findUserByEmail,
  findUserById,
  findSensitiveUserById,
  recordFailedLoginAttempt,
  resetFailedLoginAttempts,
  setPasswordResetToken,
  findUserByPasswordResetToken,
  clearPasswordResetToken,
  updatePasswordAndInvalidateSessions,
  setEmailVerificationToken,
  findUserByVerificationToken,
  markEmailAsVerified,
  updateUserProfile
} from '../models/AuthModel.js';
import {
  storeRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
  getUserActiveTokens,
  invalidateUserSessions,
  rotateRefreshToken
} from '../models/RefreshTokenModel.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry
} from '../utils/tokenUtils.js';
import {
  setAuthCookies,
  issueCsrfToken,
  clearAuthCookies
} from '../utils/authCookieUtils.js';
import { transporter } from '../config/mailer.js';
import pool from '../config/db.js';
import {
  getOrCreateDevice,
  findDeviceByRequestFingerprint,
  detectAnomalies,
  createSession,
  recordLoginAnomalies,
  createSessionVerificationToken,
  canSendAnomalyEmail,
  incrementAnomalyEmailCount,
  markSessionVerified,
  getUserActiveSessions,
  revokeSession
} from '../services/anomalyDetectionService.js';
import {
  createMFASession,
  invalidateAllUserMFASessions,
  logMFAEvent
} from '../models/MFAModel.js';
import { generateSessionToken } from '../utils/encryptionUtils.js';
import { createAuditLog, AUDIT_ACTIONS } from '../utils/auditLog.js';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 100;
const PASSWORD_RESET_TOKEN_MAX_AGE = 60 * 60 * 1000;
const MAX_LOGIN_FAILED_ATTEMPTS = 5;
const ACCOUNT_LOCKOUT_MINUTES = 30;
const ACCOUNT_LOCKOUT_SECONDS = ACCOUNT_LOCKOUT_MINUTES * 60;

const buildRetryAfterPayload = (lockedUntil, fallbackSeconds = ACCOUNT_LOCKOUT_SECONDS) => {
  const retryAfterSeconds = lockedUntil
    ? Math.max(1, Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000))
    : fallbackSeconds;

  return {
    retryAfterSeconds,
    retryAfter: retryAfterSeconds,
    lockedUntil: lockedUntil || null
  };
};

const createEmailShell = ({ title, subtitle, body, footerNote = 'GIGs Impact Community' }) => `
  <div style="margin:0;padding:32px 16px;background:#f4f7ff;font-family:Arial,'Helvetica Neue',sans-serif;color:#1f2937;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dbe5ff;box-shadow:0 18px 40px rgba(11,29,102,0.08);">
      <div style="padding:28px 32px;background:linear-gradient(135deg,#0b1d66 0%,#1e5af3 100%);color:#ffffff;">
        <div style="display:inline-block;padding:6px 12px;background:rgba(255,219,36,0.18);border:1px solid rgba(255,219,36,0.28);font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">
          GIGs Impact
        </div>
        <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.2;">${title}</h1>
        <p style="margin:0;color:rgba(255,255,255,0.84);font-size:15px;line-height:1.7;">${subtitle}</p>
      </div>
      <div style="padding:30px 32px;">
        ${body}
      </div>
      <div style="padding:20px 32px;background:#f8fbff;border-top:1px solid #e5edff;color:#64748b;font-size:13px;line-height:1.7;">
        <p style="margin:0 0 6px;"><strong style="color:#0b1d66;">${footerNote}</strong></p>
        <p style="margin:0;">This is an official message from the GIGs Impact website response system.</p>
      </div>
    </div>
  </div>
`;
// Helper: Extract client info from request
const getClientInfo = (req) => {
  return {
    userAgent: req.get('user-agent') || '',
    ipAddress: req.ip || req.connection.remoteAddress || ''
  };
};

const sendAnomalyAlertEmail = async ({ user, anomalyResult }) => {
  await transporter.sendMail({
    to: user.email,
    subject: 'New login detected on your account',
    html: createEmailShell({
      title: 'New Login Detected',
      subtitle: 'We noticed an unusual but allowed login on your account.',
      body: `
        <p>A login was completed successfully, but it triggered our security checks.</p>
        <p><strong>Risk level:</strong> ${anomalyResult.riskAssessment.level}</p>
        <p><strong>Country:</strong> ${anomalyResult.geoData.countryCode || 'Unknown'}</p>
        <p><strong>Device:</strong> ${anomalyResult.device.device_name || anomalyResult.device.deviceName || 'Unknown device'}</p>
      `
    })
  });
};

export const completeLoginForUser = async (req, user, options = {}) => {
  const {
    mfaVerified = false
  } = options;

  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);
  const { userAgent, ipAddress } = getClientInfo(req);
  const client = await pool.connect();
  let device;
  let anomalyResult;
  let session;
  let confirmToken = null;
  let denyToken = null;
  let shouldSendMediumAlert = false;

  try {
    await client.query('BEGIN');

    device = await getOrCreateDevice(user.id, req, client);
    anomalyResult = await detectAnomalies(user.id, device, req, client);

    const refreshTokenRecord = await storeRefreshToken(
      user.id,
      tokenHash,
      getRefreshTokenExpiry(),
      userAgent,
      ipAddress,
      device.id,
      client
    );

    session = await createSession({
      userId: user.id,
      deviceId: device.id,
      refreshTokenId: refreshTokenRecord.id,
      ipAddress,
      anomalyResult,
      expiresAt: refreshTokenRecord.expires_at
    }, client);

    await recordLoginAnomalies(user.id, session.id, anomalyResult, client);

    if (anomalyResult.riskAssessment.level === 'high' && !mfaVerified) {
      const canSend = await canSendAnomalyEmail(user.id, 'verification_needed', client);
      if (canSend) {
        confirmToken = await createSessionVerificationToken(session.id, user.id, 'confirm', client);
        denyToken = await createSessionVerificationToken(session.id, user.id, 'deny', client);
        await incrementAnomalyEmailCount(user.id, 'verification_needed', client);
      }
    }

    if (anomalyResult.riskAssessment.level === 'medium') {
      const canSend = await canSendAnomalyEmail(user.id, 'anomaly_alert', client);
      if (canSend) {
        shouldSendMediumAlert = true;
        await incrementAnomalyEmailCount(user.id, 'anomaly_alert', client);
      }
    }

    await client.query('COMMIT');
  } catch (transactionError) {
    await client.query('ROLLBACK');
    throw transactionError;
  } finally {
    client.release();
  }

  if (mfaVerified && !session.is_verified) {
    session = await markSessionVerified(session.id);
  }

  const accessToken = generateAccessToken({
    ...user,
    session_id: session.id
  });

  return {
    accessToken,
    refreshToken,
    session,
    anomalyResult,
    confirmToken,
    denyToken,
    shouldSendMediumAlert
  };
};

const sendSessionVerificationEmail = async ({ user, anomalyResult, confirmToken, denyToken }) => {
  const baseUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:5000/api';
  const confirmUrl = `${baseUrl}/security/confirm?token=${encodeURIComponent(confirmToken)}`;
  const denyUrl = `${baseUrl}/security/deny?token=${encodeURIComponent(denyToken)}`;

  await transporter.sendMail({
    to: user.email,
    subject: 'Was this you? Verify a suspicious login',
    html: createEmailShell({
      title: 'Verify This Login',
      subtitle: 'We detected a high-risk login and need you to confirm it.',
      body: `
        <p>This login triggered elevated risk checks.</p>
        <p><strong>Country:</strong> ${anomalyResult.geoData.countryCode || 'Unknown'}</p>
        <p><strong>Device:</strong> ${anomalyResult.device.device_name || anomalyResult.device.deviceName || 'Unknown device'}</p>
        <p><strong>Risk score:</strong> ${anomalyResult.riskAssessment.score}</p>
        <div style="margin-top:20px;">
          <a href="${confirmUrl}" style="display:inline-block;margin-right:12px;padding:12px 20px;background:#0b7a3e;color:#fff;text-decoration:none;border-radius:4px;font-weight:700;">This was me</a>
          <a href="${denyUrl}" style="display:inline-block;padding:12px 20px;background:#d32f2f;color:#fff;text-decoration:none;border-radius:4px;font-weight:700;">Not me</a>
        </div>
        <p style="margin-top:20px;">These links expire in 15 minutes.</p>
      `
    })
  });
};

const assertMailAccepted = (mailResult, recipient) => {
  const acceptedRecipients = mailResult?.accepted || [];
  const wasAccepted = acceptedRecipients.some(
    (acceptedRecipient) => acceptedRecipient?.toLowerCase?.() === recipient.toLowerCase()
  );

  if (!wasAccepted) {
    throw new Error(`Verification email was not accepted for ${recipient}`);
  }
};

/**
 * GET /auth/me
 * Get current authenticated user
 * Protected route - requires valid access token
 */
export const me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Optionally fetch fresh user data from DB
    const user = await findUserById(req.user.user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        mfaEnabled: Boolean(user.mfa_enabled),
        session: req.session
          ? {
              id: req.session.id,
              riskLevel: req.session.risk_level,
              isVerified: req.session.is_verified
            }
          : null
      }
    });
  } catch (error) {
    console.error('GET /auth/me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * POST /auth/verify-email/:token
 * Verify user email address
 * - Validates verification token
 * - Marks email as verified
 * - User can now login
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Hash the token to match what's stored in DB
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by verification token
    const user = await findUserByVerificationToken(tokenHash);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Check if token has expired
    if (!user.verification_token_expires || new Date(user.verification_token_expires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please request a new one.'
      });
    }

    // Mark email as verified
    await markEmailAsVerified(user.id);

    res.json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    console.error('POST /auth/verify-email error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

/**
 * POST /auth/register
 * Create new user account
 * - Validates input (name, email, password)
 * - Checks for duplicate email
 * - Hashes password with bcrypt
 * - Sends verification email
 * - User cannot login until email is verified
 */
export const register = async (req, res) => {
  const client = await pool.connect();

  try {
    const { full_name, email, password } = req.body;

    // Comprehensive input validation
    const validation = validateRegistrationInput(full_name, email, password, true);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const { fullName: sanitizedName, email: normalizedEmail } = validation.data;

    // Check for existing user
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password (10 salt rounds for production-grade security)
    const hashedPassword = await bcrypt.hash(password, 10);
    await client.query('BEGIN');

    // Create user with verified: false
    const user = await createUser({
      full_name: sanitizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'reader' // Default role for new users
    }, client);

    // Generate verification token (32 bytes = 64 hex characters)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await setEmailVerificationToken(
      user.id,
      verificationTokenHash,
      verificationTokenExpires,
      client
    );

    // Send verification email
    const verificationLink = `${process.env.CLIENT_ORIGIN}/verify-email/${verificationToken}`;
    
    const mailResult = await transporter.sendMail({
      from: `"GIGs Impact Team" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'Verify your GIGs Impact email address',
      html: createEmailShell({
        title: 'Verify your email address',
        subtitle: 'Complete your GIGs Impact registration by verifying your email.',
        body: `
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#334155;">Hello ${sanitizedName},</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#334155;">
            Thank you for signing up with GIGs Impact! To complete your registration, please verify your email address by clicking the button below.
          </p>
          <div style="margin:24px 0;text-align:center;">
            <a href="${verificationLink}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#0b1d66 0%,#1e5af3 100%);color:#ffffff;text-decoration:none;border-radius:6px;font-weight:700;font-size:15px;">
              Verify Email Address
            </a>
          </div>
          <p style="margin:24px 0 16px;font-size:13px;line-height:1.7;color:#64748b;">
            Or copy and paste this link in your browser:
          </p>
          <p style="margin:0 0 16px;padding:12px;background:#f8fbff;border-left:3px solid #1e5af3;font-family:'Courier New',monospace;font-size:12px;word-break:break-all;color:#334155;">
            ${verificationLink}
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#334155;">
            This link will expire in <strong>24 hours</strong>. After that, you'll need to request a new verification email.
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#334155;">
            <strong>Note:</strong> You won't be able to log in to your account until you verify your email address.
          </p>
          <p style="margin:0 0 16px;font-size:13px;line-height:1.7;color:#64748b;">
            If you didn't create this account, you can safely ignore this email.
          </p>
          <p style="margin:24px 0 0;font-size:15px;line-height:1.8;color:#334155;">
            Best regards,<br />
            <strong style="color:#0b1d66;">GIGs Impact Team</strong>
          </p>
        `,
        footerNote: 'Email Verification'
      }),
      text: `Hello ${sanitizedName},\n\nThank you for signing up! Please verify your email by visiting this link:\n\n${verificationLink}\n\nThis link expires in 24 hours.\n\nBest regards,\nGIGs Impact Team`
    });

    assertMailAccepted(mailResult, normalizedEmail);
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        verified: false
      }
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('POST /auth/register rollback error:', rollbackError);
    }

    console.error('POST /auth/register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user. Verification email could not be sent.'
    });
  } finally {
    client.release();
  }
};

/**
 * POST /auth/login
 * Authenticate user and create session
 * - Validates credentials
 * - Checks if email is verified
 * - Generates access + refresh tokens
 * - Stores refresh token (hashed) with session metadata
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists (security best practice)
      await createAuditLog(req, null, AUDIT_ACTIONS.LOGIN_FAILED_INVALID_CREDENTIALS, { email }, 'failure');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.verified) {
      await createAuditLog(req, user.id, AUDIT_ACTIONS.LOGIN_FAILED_EMAIL_NOT_VERIFIED, { email }, 'failure');
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in',
        requiresVerification: true
      });
    }

    if (
      user.account_locked &&
      user.account_locked_until &&
      new Date(user.account_locked_until) > new Date()
    ) {
      await createAuditLog(req, user.id, AUDIT_ACTIONS.LOGIN_FAILED_ACCOUNT_LOCKED, { email }, 'failure');
      const retryAfterPayload = buildRetryAfterPayload(user.account_locked_until);
      res.setHeader('Retry-After', String(retryAfterPayload.retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message: `Account temporarily locked due to multiple failed login attempts. Please wait ${retryAfterPayload.retryAfterSeconds} seconds before trying again.`,
        ...retryAfterPayload
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const failedAttemptState = await recordFailedLoginAttempt(
        user.id,
        MAX_LOGIN_FAILED_ATTEMPTS,
        ACCOUNT_LOCKOUT_MINUTES
      );

      if (failedAttemptState?.account_locked) {
        await createAuditLog(req, user.id, AUDIT_ACTIONS.ACCOUNT_LOCKED, {
          email,
          failedAttempts: failedAttemptState.login_failed_attempts,
          lockedUntil: failedAttemptState.account_locked_until
        }, 'failure');
        const retryAfterPayload = buildRetryAfterPayload(failedAttemptState.account_locked_until);
        res.setHeader('Retry-After', String(retryAfterPayload.retryAfterSeconds));

        return res.status(429).json({
          success: false,
          message: `Account temporarily locked due to multiple failed login attempts. Please wait ${retryAfterPayload.retryAfterSeconds} seconds before trying again.`,
          ...retryAfterPayload
        });
      }

      await createAuditLog(req, user.id, AUDIT_ACTIONS.LOGIN_FAILED_INVALID_CREDENTIALS, { email }, 'failure');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    await resetFailedLoginAttempts(user.id);

    const { ipAddress, userAgent } = getClientInfo(req);

    // Enforce MFA for administrator accounts: admins must enable MFA before logging in
    if (user.role === 'admin' && !user.mfa_enabled) {
      await createAuditLog(req, user.id, AUDIT_ACTIONS.MFA_SETUP_REQUIRED, {}, 'failure');
      return res.status(403).json({
        success: false,
        message: 'Administrator accounts must enable Multi-Factor Authentication before logging in.',
        requiresMFASetup: true
      });
    }

    if (user.mfa_enabled) {
      const mfaSessionToken = generateSessionToken();
      await invalidateAllUserMFASessions(user.id);
      const mfaSession = await createMFASession(user.id, mfaSessionToken, 5);

      await createAuditLog(req, user.id, AUDIT_ACTIONS.MFA_VERIFICATION_PENDING, {
        expiresAt: mfaSession.expires_at
      }, 'pending');
      await logMFAEvent(user.id, 'MFA_LOGIN_CHALLENGE_CREATED', ipAddress, userAgent, 'pending', {
        expiresAt: mfaSession.expires_at
      });

      return res.status(202).json({
        success: true,
        message: 'MFA verification required to complete login.',
        requiresMFA: true,
        mfaSessionToken,
        expiresAt: mfaSession.expires_at
      });
    }

    const {
      accessToken,
      refreshToken,
      session,
      anomalyResult,
      confirmToken,
      denyToken,
      shouldSendMediumAlert
    } = await completeLoginForUser(req, user);

    await createAuditLog(req, user.id, AUDIT_ACTIONS.LOGIN_SUCCESS, {
      sessionId: session.id,
      riskLevel: anomalyResult.riskAssessment.level,
      riskScore: anomalyResult.riskAssessment.score
    });

    if (anomalyResult.riskAssessment.score > 0) {
      await createAuditLog(req, user.id, AUDIT_ACTIONS.LOGIN_ANOMALY, {
        sessionId: session.id,
        anomalies: anomalyResult.anomalies,
        riskLevel: anomalyResult.riskAssessment.level,
        riskScore: anomalyResult.riskAssessment.score
      });
    }

    try {
      if (anomalyResult.riskAssessment.level === 'medium' && shouldSendMediumAlert) {
        await sendAnomalyAlertEmail({ user, anomalyResult });
      }

      if (anomalyResult.riskAssessment.level === 'high' && confirmToken && denyToken) {
        await sendSessionVerificationEmail({
          user,
          anomalyResult,
          confirmToken: confirmToken.token,
          denyToken: denyToken.token
        });
      }
    } catch (emailError) {
      console.error('Login anomaly email error:', emailError);
    }

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);
    const csrfToken = issueCsrfToken(req, res);

    res.json({
      success: true,
      message: 'Login successful',
      csrfToken,
      session: {
        id: session.id,
        riskLevel: anomalyResult.riskAssessment.level,
        isVerified: session.is_verified
      },
      data: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('POST /auth/login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 * - Validates refresh token
 * - Implements token rotation (old token revoked, new token issued)
 * - Detects token reuse (security: prevents token replay attacks)
 * - On reuse: Revokes ALL user sessions (indicates potential compromise)
 */
export const refresh = async (req, res) => {
  try {
    // Read refresh token from cookie
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token missing'
      });
    }

    // Hash the token to look it up in DB
    const tokenHash = hashToken(refreshToken);
    const newRefreshToken = generateRefreshToken();
    const storedToken = await findRefreshTokenByHash(tokenHash);

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const { userAgent, ipAddress } = getClientInfo(req);
    const device = await findDeviceByRequestFingerprint(storedToken.user_id, req);
    const rotationResult = await rotateRefreshToken(
      tokenHash,
      hashToken(newRefreshToken),
      getRefreshTokenExpiry(),
      userAgent,
      ipAddress,
      device?.id
    );

    if (rotationResult.status === 'reused') {
      await invalidateUserSessions(rotationResult.userId);
      await createAuditLog(req, rotationResult.userId, AUDIT_ACTIONS.TOKEN_REUSE_DETECTED, {}, 'failure');

      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }

    if (rotationResult.status === 'device_mismatch') {
      await invalidateUserSessions(rotationResult.userId);
      await createAuditLog(req, rotationResult.userId, AUDIT_ACTIONS.ACCOUNT_COMPROMISED, {
        reason: 'refresh_device_mismatch'
      }, 'failure');
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token rejected for this device. Please login again.'
      });
    }

    if (rotationResult.status === 'expired') {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }

    if (rotationResult.status === 'user_not_found') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = rotationResult.user;
    const newAccessToken = generateAccessToken({
      ...user,
      session_id: rotationResult.session?.id || null
    });
    setAuthCookies(res, newAccessToken, newRefreshToken);
    const csrfToken = issueCsrfToken(req, res);

    await createAuditLog(req, user.id, AUDIT_ACTIONS.TOKEN_REFRESH, {
      sessionId: rotationResult.session?.id || null
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      csrfToken,
      data: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('POST /auth/refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

/**
 * POST /auth/logout
 * Logout from current device
 * - Revokes current refresh token
 * - Clears cookies
 * - User remains logged in on other devices
 */
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
      // Revoke the refresh token
      const tokenHash = hashToken(refreshToken);
      const storedToken = await findRefreshTokenByHash(tokenHash);
      
      if (storedToken) {
        await revokeRefreshToken(storedToken.id);
        await pool.query(
          `UPDATE user_sessions
           SET is_active = false, logged_out_at = NOW()
           WHERE refresh_token_id = $1`,
          [storedToken.id]
        );
      }
    }

    if (req.sessionId) {
      await revokeSession(req.sessionId);
    }

    // Clear cookies
    clearAuthCookies(res);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('POST /auth/logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * POST /auth/logout-all
 * Logout from ALL devices
 * - Revokes all refresh tokens for the user
 * - Clears cookies
 * - Useful after password change or suspicious activity
 */
export const logoutAll = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { revokedCount } = await invalidateUserSessions(req.user.user_id);

    // Clear cookies
    clearAuthCookies(res);

    res.json({
      success: true,
      message: `Logged out from ${revokedCount} device(s)`,
      data: {
        revokedSessions: revokedCount
      }
    });
  } catch (error) {
    console.error('POST /auth/logout-all error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * POST /auth/active-sessions
 * Get list of active sessions/devices for current user
 * Allows user to see where they're logged in
 */
export const getActiveSessions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const sessions = await getUserActiveSessions(req.user.user_id);

    res.json({
      success: true,
      data: {
        sessions: sessions.map(s => ({
          id: s.id,
          device: s.device_name || 'Unknown',
          ipAddress: s.ip_address || 'Unknown',
          riskLevel: s.risk_level,
          isVerified: s.is_verified,
          createdAt: s.created_at,
          lastActivityAt: s.last_activity_at
        }))
      }
    });
  } catch (error) {
    console.error('GET /auth/active-sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions'
    });
  }
};

export const getCsrfToken = async (req, res) => {
  try {
    const csrfToken = issueCsrfToken(req, res);

    res.json({
      success: true,
      csrfToken
    });
  } catch (error) {
    console.error('GET /auth/csrf-token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue CSRF token'
    });
  }
};

/**
 * POST /auth/request-password-reset
 * Request password reset via email
 * - Generates a secure reset token
 * - Sends a password reset link
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email required'
      });
    }

    const user = await findUserByEmail(email);
    
    // Don't reveal if email exists (security best practice)
    if (!user) {
      return res.json({
        success: true,
        message: 'If email exists, a password reset link has been sent'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashToken(resetToken);
    const resetTokenExpires = new Date(Date.now() + PASSWORD_RESET_TOKEN_MAX_AGE);
    const resetLink = `${process.env.CLIENT_ORIGIN}/reset-password/${resetToken}`;

    await setPasswordResetToken(email, resetTokenHash, resetTokenExpires);

    await transporter.sendMail({
      from: `"GIGs Impact Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your GIGs Impact password',
      html: createEmailShell({
        title: 'Password reset request received',
        subtitle: 'Use the secure reset link below to choose a new password for your account.',
        body: `
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#334155;">Hello,</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#334155;">
            We received a request to reset your GIGs Impact account password. Click the button below to continue securely.
          </p>
          <div style="margin:24px 0;text-align:center;">
            <a href="${resetLink}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#0b1d66 0%,#1e5af3 100%);color:#ffffff;text-decoration:none;border-radius:6px;font-weight:700;font-size:15px;">
              Reset Password
            </a>
          </div>
          <p style="margin:24px 0 16px;font-size:13px;line-height:1.7;color:#64748b;">
            Or copy and paste this link in your browser:
          </p>
          <p style="margin:0 0 16px;padding:12px;background:#f8fbff;border-left:3px solid #1e5af3;font-family:'Courier New',monospace;font-size:12px;word-break:break-all;color:#334155;">
            ${resetLink}
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#334155;">
            This link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can ignore this email and your account will remain unchanged.
          </p>
          <p style="margin:24px 0 0;font-size:15px;line-height:1.8;color:#334155;">
            Best regards,<br />
            <strong style="color:#0b1d66;">GIGs Impact Team</strong>
          </p>
        `
      }),
      text: `GIGs Impact\n\nUse this link to reset your password:\n\n${resetLink}\n\nThis link expires in 1 hour. If you did not request this reset, you can ignore this email.`
    });

    res.json({
      success: true,
      message: 'If email exists, a password reset link has been sent'
    });
  } catch (error) {
    console.error('POST /auth/request-password-reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reset email'
    });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { full_name: fullNameInput, fullName } = req.body;
    const nextFullName = fullNameInput ?? fullName;
    const validation = validateFullName(nextFullName);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0] || 'Invalid full name'
      });
    }

    const updatedUser = await updateUserProfile(req.user.user_id, validation.sanitized);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await createAuditLog(req, req.user.user_id, AUDIT_ACTIONS.SETTINGS_CHANGED, {
      field: 'full_name'
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        id: updatedUser.id,
        name: updatedUser.full_name,
        email: updatedUser.email,
        role: updatedUser.role,
        mfaEnabled: Boolean(updatedUser.mfa_enabled)
      }
    });
  } catch (error) {
    console.error('PATCH /auth/profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.errors[0] || 'Password does not meet security requirements'
      });
    }

    const user = await findSensitiveUserById(req.user.user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      await createAuditLog(req, user.id, AUDIT_ACTIONS.PASSWORD_CHANGE_FAILED, {}, 'failure', 'Invalid current password');
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current password'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updatePasswordAndInvalidateSessions(user.id, user.email, hashedPassword);

    clearAuthCookies(res);

    await createAuditLog(req, user.id, AUDIT_ACTIONS.PASSWORD_CHANGED, {
      forcedLogout: true
    });

    res.json({
      success: true,
      message: 'Password changed successfully. Please sign in again.'
    });
  } catch (error) {
    console.error('POST /auth/change-password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

/**
 * POST /auth/verify-reset-token/:token
 * Verify password reset token before showing password form
 */
export const verifyPasswordResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    const user = await findUserByPasswordResetToken(hashToken(token));
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset link'
      });
    }

    if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
      await clearPasswordResetToken(user.id);
      return res.status(400).json({
        success: false,
        message: 'Reset link has expired. Please request a new one.'
      });
    }

    res.json({
      success: true,
      message: 'Reset link verified'
    });
  } catch (error) {
    console.error('POST /auth/verify-reset-token error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
};

/**
 * POST /auth/reset-password
 * Reset password using secure reset token
 * - Verifies reset token
 * - Hashes new password
 * - Revokes all existing tokens (force re-login)
 */
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, password, newPassword } = req.body;
    const nextPassword = password || newPassword;

    if (!resetToken || !nextPassword) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const passwordValidation = validatePassword(nextPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }

    const user = await findUserByPasswordResetToken(hashToken(resetToken));
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset link'
      });
    }

    if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
      await clearPasswordResetToken(user.id);
      return res.status(400).json({
        success: false,
        message: 'Reset link has expired. Please request a new one.'
      });
    }

    const hashedPassword = await bcrypt.hash(nextPassword, 10);

    const updatedUser = await updatePasswordAndInvalidateSessions(user.id, user.email, hashedPassword);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clear cookies
    clearAuthCookies(res);

    res.json({
      success: true,
      message: 'Password reset successfully. Please login again.'
    });
  } catch (error) {
    console.error('POST /auth/reset-password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};
