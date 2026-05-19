import express from 'express';
import {
  register,
  login,
  logout,
  logoutAll,
  refresh,
  getCsrfToken,
  me,
  updateMyProfile,
  changePassword,
  getActiveSessions,
  requestPasswordReset,
  verifyPasswordResetToken,
  resetPassword,
  verifyEmail
} from '../controllers/AuthController.js';
import {
  enableMFA,
  verifyMFASetup,
  verifyMFALogin,
  disableMFAEndpoint,
  getMFAStatus
} from '../controllers/MFAController.js';
import { protect, requireVerifiedSession } from '../middlewares/AuthMiddleware.js';
import {
  csrfValidationMiddleware,
  validateAllowedOrigin,
  mfaVerifyLimiter
} from '../middlewares/securityMiddleware.js';

const router = express.Router();

router.get('/csrf-token', getCsrfToken);

// Public routes
router.post('/register', validateAllowedOrigin, csrfValidationMiddleware, register);
router.post('/login', validateAllowedOrigin, csrfValidationMiddleware, login);
router.post('/verify-email/:token', verifyEmail);
router.post('/refresh', validateAllowedOrigin, csrfValidationMiddleware, refresh);
router.post('/request-password-reset', validateAllowedOrigin, csrfValidationMiddleware, requestPasswordReset);
router.post('/verify-reset-token/:token', validateAllowedOrigin, csrfValidationMiddleware, verifyPasswordResetToken);
router.post('/reset-password', validateAllowedOrigin, csrfValidationMiddleware, resetPassword);
router.post('/mfa/login-verify', validateAllowedOrigin, csrfValidationMiddleware, mfaVerifyLimiter, verifyMFALogin);

// Protected routes (require valid access token)
router.get('/me', protect, me);
router.patch('/profile', validateAllowedOrigin, csrfValidationMiddleware, protect, requireVerifiedSession, updateMyProfile);
router.post('/change-password', validateAllowedOrigin, csrfValidationMiddleware, protect, requireVerifiedSession, changePassword);
router.post('/logout', validateAllowedOrigin, csrfValidationMiddleware, protect, logout);
router.post('/logout-all', validateAllowedOrigin, csrfValidationMiddleware, protect, requireVerifiedSession, logoutAll);
router.get('/active-sessions', protect, requireVerifiedSession, getActiveSessions);
router.get('/mfa/status', protect, getMFAStatus);
router.post('/mfa/enable', validateAllowedOrigin, csrfValidationMiddleware, protect, requireVerifiedSession, enableMFA);
router.post('/mfa/verify', validateAllowedOrigin, csrfValidationMiddleware, protect, mfaVerifyLimiter, verifyMFASetup);
router.post('/mfa/disable', validateAllowedOrigin, csrfValidationMiddleware, protect, requireVerifiedSession, mfaVerifyLimiter, disableMFAEndpoint);

export default router;
