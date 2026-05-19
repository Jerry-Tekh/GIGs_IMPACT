import express from 'express';

import {protect, adminOnly, authorOnly, requireVerifiedSession, requireMFAEnrollment} from './../middlewares/AuthMiddleware.js';
import { csrfValidationMiddleware, validateAllowedOrigin } from '../middlewares/securityMiddleware.js';



import {
  createPostController,
  getPostsController,
  getSinglePostController,
  updatePostController,
  deletePostController,
  approvePostController,
  rejectPostController,
  getPendingPostsController,
  getPostsByAuthorController,
  getManagePostsController,
  updateOwnPostController,
  deleteOwnPostController
} from '../controllers/postController.js';

const router = express.Router();

// Admin Routes
router.get('/manage', protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, getManagePostsController);
router.post('/', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, createPostController);
router.put('/:id', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, updatePostController);
router.delete('/:id', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, deletePostController);
router.get('/pending', protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, getPendingPostsController);
router.patch('/:id/approve', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, approvePostController);
router.patch('/:id/reject', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, adminOnly, rejectPostController);

// Author Routes
router.post('/author', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, authorOnly, createPostController); // Author creates post
router.get('/author/myposts', protect, requireMFAEnrollment, requireVerifiedSession, authorOnly, getPostsByAuthorController); // Author sees own posts
router.put('/author/:id', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, authorOnly, updateOwnPostController);
router.delete('/author/:id', validateAllowedOrigin, csrfValidationMiddleware, protect, requireMFAEnrollment, requireVerifiedSession, authorOnly, deleteOwnPostController);

// Public/Reader Routes
router.get('/', getPostsController);
router.get('/:id', getSinglePostController);

export default router;
