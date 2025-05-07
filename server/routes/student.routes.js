import { Router } from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';
import { getAssignments, updateAssignmentStatus } from '../controllers/student.controller.js';
import { assignmentStatusValidationRules, validateRequest } from '../middleware/validate.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Apply API rate limiter to all student routes
router.use(apiLimiter);

router.get('/assignments', authenticateUser, authorizeRoles(['student']), getAssignments);
router.put(
  '/assignments/:id/status', 
  authenticateUser, 
  authorizeRoles(['student']), 
  assignmentStatusValidationRules,
  validateRequest,
  updateAssignmentStatus
);

export default router;