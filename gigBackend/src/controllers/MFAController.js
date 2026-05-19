import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcrypt';
import {
  encryptMFASecret,
  decryptMFASecret
} from '../utils/encryptionUtils.js';
import {
  generateBackupCodes,
  hashBackupCodes,
  findValidBackupCode,
  markBackupCodeAsUsed,
  getUnusedBackupCodeCount,
  normalizeCode,
  isValidBackupCodeFormat
} from '../utils/backupCodes.js';
import {
  setMFATempSecret,
  getMFATempSecret,
  activateMFA,
  disableMFA,
  getUserMFASecrets,
  validateMFASession,
  markMFASessionVerified,
  invalidateMFASession,
  recordBackupCodeUsage,
  hasBackupCodeBeenUsed,
  logMFAEvent,
  countRecentMFAFailures,
  updateUserMFABackupCodes,
  invalidateAllUserMFASessions
} from '../models/MFAModel.js';
import { findSensitiveUserById, findUserById } from '../models/AuthModel.js';
import { createAuditLog, AUDIT_ACTIONS } from '../utils/auditLog.js';
import { completeLoginForUser } from './AuthController.js';
import { setAuthCookies, issueCsrfToken } from '../utils/authCookieUtils.js';

const getClientInfo = (req) => ({
  userAgent: req.get('user-agent') || '',
  ipAddress: req.ip || req.connection.remoteAddress || ''
});
const MFA_VERIFY_LOCKOUT_SECONDS = 15 * 60;

// ============= MFA SETUP =============

/**
 * POST /auth/mfa/enable
 * Start MFA setup process
 * Returns QR code and backup codes
 */
export const enableMFA = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const userId = req.user.user_id;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already enabled
    if (user.mfa_enabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is already enabled. Disable it first to reconfigure.'
      });
    }

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `GIGs Impact (${user.email})`,
      issuer: 'GIGs Impact',
      length: 32 // Entropy for speakeasy secret
    });

    const encryptedSecret = encryptMFASecret(secret.base32);
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = hashBackupCodes(backupCodes);

    // Persist only the encrypted secret and hashed backup codes.
    await setMFATempSecret(userId, encryptedSecret, hashedBackupCodes);

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Log event
    const { ipAddress, userAgent } = getClientInfo(req);
    await logMFAEvent(userId, 'MFA_SETUP_STARTED', ipAddress, userAgent, 'success', {
      backupCodeCount: backupCodes.length
    });

    res.json({
      success: true,
      message: 'MFA setup started. Scan QR code and verify with 6-digit code.',
      qrCode,
      backupCodes: backupCodes,
      backupCodeNote: 'Save these codes in a secure place. Each can be used once if you lose access to your authenticator.'
    });
  } catch (error) {
    console.error('POST /auth/mfa/enable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable MFA'
    });
  }
};

/**
 * POST /auth/mfa/verify
 * Verify 6-digit OTP and activate MFA
 * Input: { otp }
 */
export const verifyMFASetup = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { otp } = req.body;
    const userId = req.user.user_id;

    // Validate input
    if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format. Must be 6 digits.'
      });
    }

    // Get temporary secret
    const tempSecretData = await getMFATempSecret(userId);

    if (!tempSecretData?.mfa_temp_secret_encrypted) {
      return res.status(400).json({
        success: false,
        message: 'No pending MFA setup. Start with /auth/mfa/enable'
      });
    }

    // Check setup not expired (24 hours)
    const setupStartedTime = new Date(tempSecretData.mfa_setup_started_at).getTime();
    const now = Date.now();
    if (now - setupStartedTime > 24 * 60 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: 'MFA setup expired. Please start again.'
      });
    }

    // Decrypt temporary secret
    let tempSecret;
    try {
      tempSecret = decryptMFASecret(tempSecretData.mfa_temp_secret_encrypted);
    } catch (decryptError) {
      console.error('Failed to decrypt temp secret:', decryptError);
      return res.status(500).json({
        success: false,
        message: 'Internal error during MFA verification'
      });
    }

    // Verify OTP (window: ±1 step = ±30 seconds)
    const isValidOTP = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: 'base32',
      token: otp,
      window: 1
    });

    if (!isValidOTP) {
      const { ipAddress, userAgent } = getClientInfo(req);
      await logMFAEvent(userId, 'MFA_VERIFICATION_FAILED', ipAddress, userAgent, 'failure', {
        reason: 'invalid_otp'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    await activateMFA(
      userId,
      tempSecretData.mfa_temp_secret_encrypted,
      tempSecretData.mfa_backup_codes_hashed
    );

    // Log event
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAuditLog(req, userId, AUDIT_ACTIONS.MFA_ENABLED, {}, 'success');
    await logMFAEvent(userId, 'MFA_ENABLED', ipAddress, userAgent, 'success');

    res.json({
      success: true,
      message: 'Multi-Factor Authentication enabled successfully.',
      data: {
        mfaEnabled: true,
        backupCodesCount: 10,
        note: 'MFA will be required on your next login. Keep your backup codes safe.'
      }
    });
  } catch (error) {
    console.error('POST /auth/mfa/verify error:', error);
    res.status(500).json({
      success: false,
      message: 'MFA verification failed'
    });
  }
};

// ============= MFA LOGIN =============

/**
 * POST /auth/mfa/login-verify
 * Verify MFA token or backup code during login
 * Input: { mfaSessionToken, otp or backupCode }
 */
export const verifyMFALogin = async (req, res) => {
  try {
    const { mfaSessionToken, otp, backupCode } = req.body;

    if (!mfaSessionToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid MFA session'
      });
    }

    if (!otp && !backupCode) {
      return res.status(400).json({
        success: false,
        message: 'Provide either OTP or backup code'
      });
    }

    const mfaSession = await validateMFASession(mfaSessionToken);

    if (!mfaSession) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired MFA session. Please login again.'
      });
    }

    const userId = mfaSession.user_id;

    const mfaSecrets = await getUserMFASecrets(userId);
    const user = await findSensitiveUserById(userId);

    if (!user || !mfaSecrets?.mfa_enabled || !mfaSecrets.mfa_secret_encrypted) {
      return res.status(500).json({
        success: false,
        message: 'MFA not properly configured'
      });
    }

    let decryptedSecret;
    try {
      decryptedSecret = decryptMFASecret(mfaSecrets.mfa_secret_encrypted);
    } catch (decryptError) {
      console.error('Failed to decrypt MFA secret:', decryptError);
      return res.status(500).json({
        success: false,
        message: 'Internal error during MFA verification'
      });
    }

    let isValid = false;
    let codeIndex = null;

    const { ipAddress, userAgent } = getClientInfo(req);

    if (otp) {
      if (!/^\d{6}$/.test(otp)) {
        await logMFAEvent(userId, 'MFA_VERIFICATION_FAILED', ipAddress, userAgent, 'failure', {
          reason: 'invalid_otp_format'
        });

        return res.status(400).json({
          success: false,
          message: 'Invalid OTP format'
        });
      }

      isValid = speakeasy.totp.verify({
        secret: decryptedSecret,
        encoding: 'base32',
        token: otp,
        window: 1
      });

      if (!isValid) {
        await logMFAEvent(userId, 'MFA_VERIFICATION_FAILED', ipAddress, userAgent, 'failure', {
          reason: 'invalid_otp'
        });
      }
    } else if (backupCode) {
      const normalizedCode = normalizeCode(backupCode);

      if (!isValidBackupCodeFormat(backupCode)) {
        await logMFAEvent(userId, 'MFA_VERIFICATION_FAILED', ipAddress, userAgent, 'failure', {
          reason: 'invalid_backup_code_format'
        });

        return res.status(400).json({
          success: false,
          message: 'Invalid backup code format'
        });
      }

      codeIndex = findValidBackupCode(normalizedCode, mfaSecrets.mfa_backup_codes_hashed);

      if (codeIndex === null) {
        await logMFAEvent(userId, 'MFA_VERIFICATION_FAILED', ipAddress, userAgent, 'failure', {
          reason: 'invalid_or_used_backup_code'
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid or already used backup code'
        });
      }

      const alreadyUsed = await hasBackupCodeBeenUsed(userId, codeIndex);
      if (alreadyUsed) {
        await logMFAEvent(userId, 'MFA_VERIFICATION_FAILED', ipAddress, userAgent, 'failure', {
          reason: 'backup_code_already_used'
        });

        return res.status(401).json({
          success: false,
          message: 'This backup code has already been used'
        });
      }

      isValid = true;
    }

    if (!isValid) {
      const recentFailures = await countRecentMFAFailures(userId, 15);
      if (recentFailures >= 5) {
        await logMFAEvent(userId, 'MFA_VERIFICATION_FAILED', ipAddress, userAgent, 'failure', {
          reason: 'rate_limit_exceeded'
        });
        res.setHeader('Retry-After', String(MFA_VERIFY_LOCKOUT_SECONDS));

        return res.status(429).json({
          success: false,
          message: `Too many failed verification attempts. Please wait ${MFA_VERIFY_LOCKOUT_SECONDS} seconds before trying again.`,
          retryAfterSeconds: MFA_VERIFY_LOCKOUT_SECONDS,
          retryAfter: MFA_VERIFY_LOCKOUT_SECONDS
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid OTP or backup code'
      });
    }

    if (codeIndex !== null) {
      await recordBackupCodeUsage(userId, codeIndex, ipAddress, userAgent);

      const updatedCodes = markBackupCodeAsUsed(
        mfaSecrets.mfa_backup_codes_hashed,
        codeIndex
      );

      await updateUserMFABackupCodes(userId, updatedCodes);

      const remainingCodes = getUnusedBackupCodeCount(updatedCodes);

      await logMFAEvent(userId, 'MFA_BACKUP_CODE_USED', ipAddress, userAgent, 'success', {
        remainingCodes
      });
    } else {
      await logMFAEvent(userId, 'MFA_VERIFIED', ipAddress, userAgent, 'success');
    }

    await markMFASessionVerified(mfaSession.id);
    await invalidateMFASession(mfaSession.id);

    const {
      accessToken,
      refreshToken,
      session,
      anomalyResult
    } = await completeLoginForUser(req, user, { mfaVerified: true });

    setAuthCookies(res, accessToken, refreshToken);
    const csrfToken = issueCsrfToken(req, res);

    await createAuditLog(req, userId, AUDIT_ACTIONS.MFA_VERIFICATION_SUCCESS, {
      sessionId: session.id,
      method: codeIndex !== null ? 'backup_code' : 'otp'
    }, 'success');
    await createAuditLog(req, userId, AUDIT_ACTIONS.LOGIN_SUCCESS, {
      sessionId: session.id,
      riskLevel: anomalyResult.riskAssessment.level,
      riskScore: anomalyResult.riskAssessment.score,
      completedWithMFA: true
    });

    if (anomalyResult.riskAssessment.score > 0) {
      await createAuditLog(req, userId, AUDIT_ACTIONS.LOGIN_ANOMALY, {
        sessionId: session.id,
        anomalies: anomalyResult.anomalies,
        riskLevel: anomalyResult.riskAssessment.level,
        riskScore: anomalyResult.riskAssessment.score,
        resolvedWithMFA: true
      });
    }

    res.json({
      success: true,
      message: 'MFA verified and login completed successfully.',
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
    console.error('POST /auth/mfa/login-verify error:', error);
    res.status(500).json({
      success: false,
      message: 'MFA verification failed'
    });
  }
};

// ============= MFA DISABLE =============

/**
 * POST /auth/mfa/disable
 * Disable MFA for user
 * Requires: password or valid OTP
 */
export const disableMFAEndpoint = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { password, otp } = req.body;
    const userId = req.user.user_id;

    const user = await findSensitiveUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.mfa_enabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not enabled'
      });
    }

    let verified = false;

    // Verify with password
    if (password) {
      verified = await bcrypt.compare(password, user.password);

      if (!verified) {
        const { ipAddress, userAgent } = getClientInfo(req);
        await logMFAEvent(userId, 'MFA_DISABLE_FAILED', ipAddress, userAgent, 'failure', {
          reason: 'invalid_password'
        });
      }
    }
    // Verify with OTP
    else if (otp) {
      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP format'
        });
      }

      const mfaSecrets = await getUserMFASecrets(userId);

      if (!mfaSecrets?.mfa_secret_encrypted) {
        return res.status(500).json({
          success: false,
          message: 'MFA not properly configured'
        });
      }

      let decryptedSecret;
      try {
        decryptedSecret = decryptMFASecret(mfaSecrets.mfa_secret_encrypted);
      } catch (decryptError) {
        return res.status(500).json({
          success: false,
          message: 'Internal error during MFA verification'
        });
      }

      verified = speakeasy.totp.verify({
        secret: decryptedSecret,
        encoding: 'base32',
        token: otp,
        window: 1
      });

      if (!verified) {
        const { ipAddress, userAgent } = getClientInfo(req);
        await logMFAEvent(userId, 'MFA_DISABLE_FAILED', ipAddress, userAgent, 'failure', {
          reason: 'invalid_otp'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Provide either password or OTP'
      });
    }

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Verification failed. Incorrect password or OTP.'
      });
    }

    // Disable MFA
    await disableMFA(userId);
    await invalidateAllUserMFASessions(userId);

    // Log events
    const { ipAddress, userAgent } = getClientInfo(req);
    await createAuditLog(req, userId, AUDIT_ACTIONS.MFA_DISABLED, {}, 'success');
    await logMFAEvent(userId, 'MFA_DISABLED', ipAddress, userAgent, 'success');

    res.json({
      success: true,
      message: 'Multi-Factor Authentication has been disabled.',
      mfaEnabled: false
    });
  } catch (error) {
    console.error('POST /auth/mfa/disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable MFA'
    });
  }
};

// ============= MFA STATUS =============

/**
 * GET /auth/mfa/status
 * Get user's MFA status
 */
export const getMFAStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const userId = req.user.user_id;
    const mfaSecrets = await getUserMFASecrets(userId);

    if (!mfaSecrets) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const backupCodeCount = mfaSecrets.mfa_backup_codes_hashed
      ? getUnusedBackupCodeCount(mfaSecrets.mfa_backup_codes_hashed)
      : 0;

    res.json({
      success: true,
      data: {
        mfaEnabled: mfaSecrets.mfa_enabled,
        mfaEnabledAt: mfaSecrets.mfa_enabled_at,
        backupCodesRemaining: backupCodeCount
      }
    });
  } catch (error) {
    console.error('GET /auth/mfa/status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch MFA status'
    });
  }
};
