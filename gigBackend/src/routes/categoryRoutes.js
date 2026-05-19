import express from 'express';
import { getCategoriesController } from '../controllers/categoryController.js';

const router = express.Router();

// Routes
router.get('/', getCategoriesController);

export default router;