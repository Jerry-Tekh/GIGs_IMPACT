import express from 'express';
import { getAllUsersController, updateUserRoleController } from '../controllers/UserController.js';
import { protect, adminOnly, requireVerifiedSession, requireMFAEnrollment } from '../middlewares/AuthMiddleware.js';
import { csrfValidationMiddleware, validateAllowedOrigin } from '../middlewares/securityMiddleware.js';

const router = express.Router();

// Admin: Get all users
router.get('/', protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, getAllUsersController);

// Admin: Update user role
router.patch('/:userId/role', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, updateUserRoleController);

export default router;
