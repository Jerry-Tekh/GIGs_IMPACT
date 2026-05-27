import express from 'express';
import { protect, adminOnly, requireVerifiedSession, requireMFAEnrollment } from '../middlewares/AuthMiddleware.js';
import { csrfValidationMiddleware, validateAllowedOrigin } from '../middlewares/securityMiddleware.js';
import {
  createCarouselController,
  getPublicCarouselController,
  updateCarouselController,
  deleteCarouselController
} from '../controllers/carouselController.js';

const router = express.Router();

// Public: list active carousel items
router.get('/', getPublicCarouselController);

// Admin-managed endpoints
router.post('/', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, createCarouselController);
router.put('/:id', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, updateCarouselController);
router.delete('/:id', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, deleteCarouselController);

export default router;
