import { Router } from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';
import { getAssignments, createAssignment } from '../controllers/teacher.controller.js';
import { assignmentValidationRules, validateRequest } from '../middleware/validate.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Apply API rate limiter to all teacher routes
router.use(apiLimiter);

router.get('/assignments', authenticateUser, authorizeRoles(['teacher']), getAssignments);
router.post(
  '/assignments', 
  authenticateUser, 
  authorizeRoles(['teacher']), 
  assignmentValidationRules,
  validateRequest,
  createAssignment
);

export default router;