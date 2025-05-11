import { Router } from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';
import { 
  getAssignments, 
  createAssignment, 
  getAllStudents,
  getAllClasses,
  assignStudentToClass, 
  removeStudentFromClass,
  getDashboardStats,
  getStudentsPerformance,
  getRecentActivities,
  getUpcomingEvents,
  markTeacherAttendance,
  getAttendanceStats,
  getAverageAttendance,
  getClassStudents,
  checkTeacherAttendance,
  getAllCoursesForTeacher,
  updateAssignment
} from '../controllers/teacher.controller.js';
import { assignmentValidationRules, validateRequest } from '../middleware/validate.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Apply API rate limiter to all teacher routes
router.use(apiLimiter);

// Assignment routes
router.get('/assignments', authenticateUser, authorizeRoles(['teacher']), getAssignments);
router.post(
  '/assignments', 
  authenticateUser, 
  authorizeRoles(['teacher']), 
  assignmentValidationRules,
  validateRequest,
  createAssignment
);
router.put('/assignments/:id', authenticateUser, authorizeRoles(['teacher']), updateAssignment);

// Student-Class assignment management
router.get('/students', authenticateUser, authorizeRoles(['teacher']), getAllStudents);
router.get('/classes', authenticateUser, authorizeRoles(['teacher']), getAllClasses);
router.post('/students/assign', authenticateUser, authorizeRoles(['teacher']), assignStudentToClass);
router.delete('/students/:studentId/class', authenticateUser, authorizeRoles(['teacher']), removeStudentFromClass);

// Teacher Dashboard routes
router.get('/dashboard/stats', authenticateUser, authorizeRoles(['teacher']), getDashboardStats);
router.get('/students/performance', authenticateUser, authorizeRoles(['teacher']), getStudentsPerformance);
router.get('/activities', authenticateUser, authorizeRoles(['teacher']), getRecentActivities);
router.get('/events/upcoming', authenticateUser, authorizeRoles(['teacher']), getUpcomingEvents);

// Attendance endpoints
router.post('/attendance/mark', authenticateUser, authorizeRoles(['teacher']), markTeacherAttendance);
router.get('/attendance/stats', authenticateUser, authorizeRoles(['teacher']), getAttendanceStats);
router.get('/attendance/average', authenticateUser, authorizeRoles(['teacher']), getAverageAttendance);
router.get('/attendance/self', authenticateUser, authorizeRoles(['teacher']), checkTeacherAttendance);

// New route for fetching students for a specific class
router.get('/classes/:classId/students', authenticateUser, authorizeRoles(['teacher']), getClassStudents);

// New route for fetching courses for a teacher
router.get('/courses', authenticateUser, authorizeRoles(['teacher']), getAllCoursesForTeacher);

export default router;