import { Router } from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth.js';
import {
  getRegistrationRequests,
  approveRegistration,
  rejectRegistration,
  getUsers,
  deactivateUser,
  reactivateUser,
  getDashboardStats,
  getRecentActivities,
  getToolUsageStats,
  getActivityTrends,
  getFilteredAttendance,
  assignTeacherToClassCourse,
  getAllClasses,
  getAllCourses,
  getAllTeacherAssignments,
  deleteTeacherAssignment,
  updateTeacherAssignment,
  allocateStudentToClass,
  removeStudentAllocation
} from '../controllers/admin.controller.js';

const router = Router();

// Remove or comment out the rate limiter for admin routes
// router.use(apiLimiter);

// Dashboard routes
router.get('/dashboard/stats', authenticateUser, authorizeRoles(['admin']), getDashboardStats);
router.get('/dashboard/activities', authenticateUser, authorizeRoles(['admin']), getRecentActivities);
router.get('/dashboard/tool-usage', authenticateUser, authorizeRoles(['admin']), getToolUsageStats);
router.get('/dashboard/activity-trends', authenticateUser, authorizeRoles(['admin']), getActivityTrends);
router.get('/dashboard/attendance', authenticateUser, authorizeRoles(['admin']), getFilteredAttendance);

// Registration requests routes
router.get('/registration-requests', authenticateUser, authorizeRoles(['admin']), getRegistrationRequests);
router.put(
  '/registration-requests/:id/approve', 
  authenticateUser, 
  authorizeRoles(['admin']),
  approveRegistration
);
router.put(
  '/registration-requests/:id/reject', 
  authenticateUser, 
  authorizeRoles(['admin']),
  rejectRegistration
);

// User management routes
router.get('/users', authenticateUser, authorizeRoles(['admin']), getUsers);
router.put(
  '/users/:id/deactivate', 
  authenticateUser, 
  authorizeRoles(['admin']),
  deactivateUser
);
router.put(
  '/users/:id/reactivate', 
  authenticateUser, 
  authorizeRoles(['admin']),
  reactivateUser
);

// Teacher/class/course assignment
router.post('/assign-teacher', authenticateUser, authorizeRoles(['admin']), assignTeacherToClassCourse);
router.get('/classes', authenticateUser, authorizeRoles(['admin']), getAllClasses);
router.get('/courses', authenticateUser, authorizeRoles(['admin']), getAllCourses);
router.get('/teacher-assignments', authenticateUser, authorizeRoles(['admin']), getAllTeacherAssignments);
router.delete('/teacher-assignments/:id', authenticateUser, authorizeRoles(['admin']), deleteTeacherAssignment);
router.put('/teacher-assignments/:id', authenticateUser, authorizeRoles(['admin']), updateTeacherAssignment);

// Student/class allocation
router.post('/allocate-student', authenticateUser, authorizeRoles(['admin']), allocateStudentToClass);
router.delete('/remove-student-allocation/:studentId', authenticateUser, authorizeRoles(['admin']), removeStudentAllocation);

export default router;