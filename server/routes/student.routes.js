import { Router } from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';
import { 
  getAssignments, 
  updateAssignmentStatus, 
  getClasses, 
  getClassAssignments,
  getDashboardStats,
  getStudentCourses,
  getUpcomingAssignments,
  getAttendanceHistory
} from '../controllers/student.controller.js';
import { assignmentStatusValidationRules, validateRequest } from '../middleware/validate.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Apply API rate limiter to all student routes
router.use(apiLimiter);

// Get dashboard stats
router.get('/dashboard/stats', authenticateUser, authorizeRoles(['student']), getDashboardStats);

// Get all classes for a student
router.get('/classes', authenticateUser, authorizeRoles(['student']), getClasses);

// Get assignments for a specific class
router.get('/classes/:classId/assignments', authenticateUser, authorizeRoles(['student']), getClassAssignments);

// Get all assignments
router.get('/assignments', authenticateUser, authorizeRoles(['student']), getAssignments);

// Get upcoming assignments
router.get('/assignments/upcoming', authenticateUser, authorizeRoles(['student']), getUpcomingAssignments);

// Update assignment status
router.put(
  '/assignments/:id/status', 
  authenticateUser, 
  authorizeRoles(['student']), 
  assignmentStatusValidationRules,
  validateRequest,
  updateAssignmentStatus
);

// Get student courses
router.get('/courses', authenticateUser, authorizeRoles(['student']), getStudentCourses);

// Get attendance history
router.get('/attendance/history', authenticateUser, authorizeRoles(['student']), getAttendanceHistory);

export default router;