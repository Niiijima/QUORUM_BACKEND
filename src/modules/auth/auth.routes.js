import { Router } from 'express';
import { login, register, getMe } from './auth.controller.js'; // Ensure getMe is imported
import { protect } from '../../middleware/auth.js'; // Assuming you have an auth middleware

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe); 

export default router;