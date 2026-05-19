import express from 'express';
import { sendContactEmail, sendVolunteerEmail  } from './../controllers/ContactController.js';
import { validateAllowedOrigin } from '../middlewares/securityMiddleware.js';


const router = express.Router();


router.post('/', validateAllowedOrigin, sendContactEmail);
router.post('/volunteer', validateAllowedOrigin, sendVolunteerEmail);

export default router;
