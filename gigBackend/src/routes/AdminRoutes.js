import express from 'express';  
import { protect, adminOnly, requireVerifiedSession, requireMFAEnrollment } from './../middlewares/AuthMiddleware.js';
import { csrfValidationMiddleware, validateAllowedOrigin } from '../middlewares/securityMiddleware.js';
const router = express.Router();

import {getAdminStatsController, getAnalyticsController} from './../controllers/AdminController.js';
import {createPostController, updatePostController, deletePostController} from './../controllers/postController.js';


router.get('/stats', protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, getAdminStatsController);
router.get('/analytics', protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, getAnalyticsController);

router.post('/posts', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, createPostController);
router.put('/posts/:id', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, updatePostController);
router.delete('/posts/:id', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, deletePostController);

export default router;

