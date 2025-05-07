import { Router } from 'express';
import { register, login, verifyToken } from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.js';
import { 
  registerValidationRules, 
  loginValidationRules, 
  validateRequest 
} from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post(
  '/register', 
  authLimiter,
  registerValidationRules, 
  validateRequest, 
  register
);

router.post(
  '/login', 
  authLimiter,
  loginValidationRules, 
  validateRequest, 
  login
);

router.get('/verify', authenticateUser, verifyToken);

export default router;