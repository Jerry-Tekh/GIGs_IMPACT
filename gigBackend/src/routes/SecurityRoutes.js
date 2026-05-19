/**
 * SECURITY ROUTES
 * Endpoints for session anomaly verification and breach response.
 */

import express from 'express';
import crypto from 'crypto';
import {
  verifySecurityToken,
  confirmSession,
  handleSecurityBreach,
  getSession
} from '../services/anomalyDetectionService.js';
import { createAuditLog, AUDIT_ACTIONS } from '../utils/auditLog.js';
import { transporter } from '../config/mailer.js';
import { protect } from '../middlewares/AuthMiddleware.js';
import { generateCSRFToken, verifyCSRFToken } from '../utils/generateCsrf.js';

const router = express.Router();
const SECURITY_ACTION_CSRF_COOKIE = 'security_action_csrf_secret';
const SECURITY_ACTION_CSRF_MAX_AGE = 15 * 60 * 1000;
const allowedSecurityActions = new Set(['confirm', 'deny']);

const resolveCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/api/security'
  };
};

const setSecurityActionCsrfCookie = (res, secret) => {
  res.cookie(SECURITY_ACTION_CSRF_COOKIE, secret, {
    ...resolveCookieOptions(),
    maxAge: SECURITY_ACTION_CSRF_MAX_AGE
  });
};

const clearSecurityActionCsrfCookie = (res) => {
  res.clearCookie(SECURITY_ACTION_CSRF_COOKIE, resolveCookieOptions());
};

const issueSecurityActionCsrfToken = (res) => {
  const secret = crypto.randomBytes(32).toString('hex');
  setSecurityActionCsrfCookie(res, secret);
  return generateCSRFToken(secret);
};

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const renderSecurityActionPage = ({ token, action, deviceName, createdAt, error = null, csrfToken = '' }) => {
  const title = action === 'confirm' ? 'Approve suspicious login' : 'Block suspicious login';
  const subtitle = action === 'confirm'
    ? 'Review this login and confirm it only if you recognize it.'
    : 'Block this login and revoke access if you do not recognize it.';
  const buttonLabel = action === 'confirm' ? 'Yes, this was me' : 'No, secure my account';
  const accent = action === 'confirm' ? '#0b7a3e' : '#d32f2f';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { margin: 0; font-family: Arial, Helvetica, sans-serif; background: #f4f7ff; color: #1f2937; }
      main { max-width: 680px; margin: 48px auto; background: #fff; border: 1px solid #dbe5ff; box-shadow: 0 18px 40px rgba(11,29,102,0.08); }
      header { padding: 28px 32px; background: linear-gradient(135deg,#0b1d66 0%,#1e5af3 100%); color: #fff; }
      section { padding: 28px 32px; }
      .tag { display: inline-block; padding: 6px 12px; background: rgba(255,219,36,0.18); border: 1px solid rgba(255,219,36,0.28); font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
      .card { margin-top: 20px; padding: 16px; background: #f8fbff; border-left: 4px solid ${accent}; }
      .error { margin-bottom: 16px; padding: 12px 14px; background: #fff1f2; border: 1px solid #fecdd3; color: #9f1239; }
      button { margin-top: 24px; padding: 12px 22px; border: 0; border-radius: 6px; background: ${accent}; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; }
      p { line-height: 1.7; }
      footer { padding: 20px 32px; background: #f8fbff; border-top: 1px solid #e5edff; color: #64748b; font-size: 13px; }
    </style>
  </head>
  <body>
    <main>
      <header>
        <span class="tag">GIGs Impact Security</span>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(subtitle)}</p>
      </header>
      <section>
        ${error ? `<div class="error">${escapeHtml(error)}</div>` : ''}
        <p>This page will not make any changes until you click the button below.</p>
        <div class="card">
          <p><strong>Action:</strong> ${escapeHtml(action)}</p>
          <p><strong>Device:</strong> ${escapeHtml(deviceName || 'Unknown device')}</p>
          <p><strong>Requested:</strong> ${escapeHtml(createdAt ? new Date(createdAt).toLocaleString() : 'Unknown time')}</p>
        </div>
        <form method="post" action="/api/security/${escapeHtml(action)}">
          <input type="hidden" name="token" value="${escapeHtml(token)}" />
          <input type="hidden" name="csrfToken" value="${escapeHtml(csrfToken)}" />
          <button type="submit">${escapeHtml(buttonLabel)}</button>
        </form>
      </section>
      <footer>This action requires a real user interaction. Email previews and scanners cannot approve or deny logins automatically.</footer>
    </main>
  </body>
</html>`;
};

const resolveRequestedAction = (req) => req.path.includes('/deny') ? 'deny' : 'confirm';

const validateSecurityActionRequest = async (req, res) => {
  const token = req.method === 'GET' ? req.query.token : req.body?.token;
  const action = resolveRequestedAction(req);

  if (!token) {
    res.status(400).json({ success: false, message: 'Verification token missing' });
    return null;
  }

  if (!allowedSecurityActions.has(action)) {
    res.status(400).json({ success: false, message: 'Invalid security action' });
    return null;
  }

  const verificationRecord = await verifySecurityToken(token);
  if (!verificationRecord || verificationRecord.action !== action) {
    res.status(400).json({
      success: false,
      message: 'Invalid or expired verification link'
    });
    return null;
  }

  return { token, action, verificationRecord };
};

const validateSecurityActionCsrf = (req, res) => {
  const token = req.body?.csrfToken;
  const secret = req.cookies?.[SECURITY_ACTION_CSRF_COOKIE];

  if (!token || !secret || !verifyCSRFToken(secret, token)) {
    res.status(403).json({
      success: false,
      message: 'Invalid security confirmation request'
    });
    return false;
  }

  return true;
};

const createEmailShell = ({ title, subtitle, body, footerNote = 'GIGs Impact Community' }) => `
  <div style="margin:0;padding:32px 16px;background:#f4f7ff;font-family:Arial,'Helvetica Neue',sans-serif;color:#1f2937;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dbe5ff;box-shadow:0 18px 40px rgba(11,29,102,0.08);">
      <div style="padding:28px 32px;background:linear-gradient(135deg,#0b1d66 0%,#1e5af3 100%);color:#ffffff;">
        <div style="display:inline-block;padding:6px 12px;background:rgba(255,219,36,0.18);border:1px solid rgba(255,219,36,0.28);font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">
          GIGs Impact Security
        </div>
        <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.2;">${title}</h1>
        <p style="margin:0;color:rgba(255,255,255,0.84);font-size:15px;line-height:1.7;">${subtitle}</p>
      </div>
      <div style="padding:30px 32px;">
        ${body}
      </div>
      <div style="padding:20px 32px;background:#f8fbff;border-top:1px solid #e5edff;color:#64748b;font-size:13px;line-height:1.7;">
        <p style="margin:0 0 6px;"><strong style="color:#0b1d66;">${footerNote}</strong></p>
        <p style="margin:0;">This is an official security message from GIGs Impact.</p>
      </div>
    </div>
  </div>
`;

const confirmHandler = async (req, res) => {
  try {
    const requestContext = await validateSecurityActionRequest(req, res);
    if (!requestContext) {
      return;
    }

    if (req.method === 'GET') {
      const csrfToken = issueSecurityActionCsrfToken(res);
      return res
        .status(200)
        .type('html')
        .send(renderSecurityActionPage({
          token: requestContext.token,
          action: 'confirm',
          deviceName: requestContext.verificationRecord.device_name,
          createdAt: requestContext.verificationRecord.created_at,
          csrfToken
        }));
    }

    if (!validateSecurityActionCsrf(req, res)) {
      await createAuditLog(req, requestContext.verificationRecord.user_id, AUDIT_ACTIONS.CSRF_VALIDATION_FAILED, {
        action: 'security_confirm'
      }, 'failure');
      return;
    }

    await confirmSession(requestContext.verificationRecord.session_id, requestContext.verificationRecord.id);
    clearSecurityActionCsrfCookie(res);

    await createAuditLog(
      req,
      requestContext.verificationRecord.user_id,
      AUDIT_ACTIONS.LOGIN_ANOMALY,
      {
        sessionId: requestContext.verificationRecord.session_id,
        action: 'confirmed',
        type: 'suspicious_login_verified'
      },
      'success'
    );

    if (requestContext.verificationRecord.user_email) {
      await transporter.sendMail({
        to: requestContext.verificationRecord.user_email,
        subject: 'Login confirmed',
        html: createEmailShell({
          title: 'Login Confirmed',
          subtitle: 'Your suspicious login has been approved.',
          body: `
            <p>We have marked this session as verified.</p>
            <p><strong>Device:</strong> ${requestContext.verificationRecord.device_name || 'Unknown device'}</p>
            <p><strong>Time:</strong> ${new Date(requestContext.verificationRecord.created_at).toLocaleString()}</p>
          `
        })
      });
    }

    return res.json({
      success: true,
      message: 'Login confirmed. This device is now trusted.'
    });
  } catch (error) {
    console.error('Error confirming session:', error);
    await createAuditLog(req, null, 'LOGIN_ANOMALY_CONFIRM_ERROR', { error: error.message }, 'failure', error.message);
    return res.status(500).json({ success: false, message: 'Failed to confirm login' });
  }
};

const denyHandler = async (req, res) => {
  try {
    const requestContext = await validateSecurityActionRequest(req, res);
    if (!requestContext) {
      return;
    }

    if (req.method === 'GET') {
      const csrfToken = issueSecurityActionCsrfToken(res);
      return res
        .status(200)
        .type('html')
        .send(renderSecurityActionPage({
          token: requestContext.token,
          action: 'deny',
          deviceName: requestContext.verificationRecord.device_name,
          createdAt: requestContext.verificationRecord.created_at,
          csrfToken
        }));
    }

    if (!validateSecurityActionCsrf(req, res)) {
      await createAuditLog(req, requestContext.verificationRecord.user_id, AUDIT_ACTIONS.CSRF_VALIDATION_FAILED, {
        action: 'security_deny'
      }, 'failure');
      return;
    }

    const breachResponse = await handleSecurityBreach(
      requestContext.verificationRecord.user_id,
      requestContext.verificationRecord.session_id,
      requestContext.verificationRecord.id
    );
    clearSecurityActionCsrfCookie(res);

    if (requestContext.verificationRecord.user_email) {
      await transporter.sendMail({
        to: requestContext.verificationRecord.user_email,
        subject: 'Suspicious login blocked - password reset required',
        html: createEmailShell({
          title: 'Suspicious Activity Blocked',
          subtitle: 'We revoked all sessions to protect your account.',
          body: `
            <p>We received your report that this login was not you.</p>
            <p>All sessions and refresh tokens have been revoked.</p>
            <p><strong>Next step:</strong> reset your password immediately.</p>
            <a href="${process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN}/reset-password/${breachResponse.resetToken}"
               style="display:inline-block;padding:12px 24px;background:#d32f2f;color:#fff;text-decoration:none;border-radius:4px;font-weight:700;">
              Reset Password
            </a>
          `
        })
      });
    }

    await createAuditLog(
      req,
      requestContext.verificationRecord.user_id,
      AUDIT_ACTIONS.ACCOUNT_COMPROMISED,
      {
        sessionId: requestContext.verificationRecord.session_id,
        action: 'denied',
        passwordResetRequired: true,
        revokedAllSessions: true
      },
      'success'
    );

    return res.json({
      success: true,
      message: 'Account secured. All sessions revoked and password reset required.'
    });
  } catch (error) {
    console.error('Error denying suspicious session:', error);
    await createAuditLog(req, null, 'ACCOUNT_COMPROMISED_DENY_ERROR', { error: error.message }, 'failure', error.message);
    return res.status(500).json({ success: false, message: 'Failed to process security incident' });
  }
};

router.get('/confirm', confirmHandler);
router.post('/confirm', confirmHandler);
router.get('/deny', denyHandler);
router.post('/deny', denyHandler);

router.get('/status', protect, async (req, res) => {
  try {
    if (!req.sessionId) {
      return res.status(404).json({
        success: false,
        message: 'Session context not available'
      });
    }

    const session = await getSession(req.sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    return res.json({
      success: true,
      sessionStatus: {
        sessionId: session.id,
        riskLevel: session.risk_level,
        isVerified: session.is_verified,
        isNewDevice: session.is_new_device,
        isNewCountry: session.is_new_country,
        isImpossibleTravel: session.is_impossible_travel,
        deviceName: session.device_name,
        country: session.country_code,
        createdAt: session.created_at
      }
    });
  } catch (error) {
    console.error('Error getting security status:', error);
    return res.status(500).json({ success: false, message: 'Failed to get security status' });
  }
});

export default router;
