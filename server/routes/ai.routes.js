import { Router } from 'express';
import { handleAIValidation, handleLessonPlanGeneration } from '../controllers/ai.controller.js';
import { authenticateUser } from '../middleware/auth.js';
import { aiPromptValidationRules, validateRequest } from '../middleware/validate.js';
import { aiLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post(
  '/validate',
  authenticateUser,
  aiLimiter,
  aiPromptValidationRules,
  validateRequest,
  handleAIValidation
);

router.post(
  '/lesson-plan',
  authenticateUser,
  aiLimiter,
  validateRequest,
  handleLessonPlanGeneration
);

export default router;