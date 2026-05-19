import express from 'express';
import { protect, requireMFAEnrollment, requireVerifiedSession } from '../middlewares/AuthMiddleware.js';
import { csrfValidationMiddleware, validateAllowedOrigin } from '../middlewares/securityMiddleware.js';
import { cleanupUploadController, signUploadController } from '../controllers/uploadController.js';

const router = express.Router();

router.post(
  '/sign',
  validateAllowedOrigin,
  csrfValidationMiddleware,
  protect,
  requireMFAEnrollment,
  requireVerifiedSession,
  signUploadController
);

router.post(
  '/cleanup',
  validateAllowedOrigin,
  csrfValidationMiddleware,
  protect,
  requireMFAEnrollment,
  requireVerifiedSession,
  cleanupUploadController
);

export default router;
