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
  getActivityTrends
} from '../controllers/admin.controller.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Apply API rate limiter to all admin routes
router.use(apiLimiter);

// Dashboard routes
router.get('/dashboard/stats', authenticateUser, authorizeRoles(['admin']), getDashboardStats);
router.get('/dashboard/activities', authenticateUser, authorizeRoles(['admin']), getRecentActivities);
router.get('/dashboard/tool-usage', authenticateUser, authorizeRoles(['admin']), getToolUsageStats);
router.get('/dashboard/activity-trends', authenticateUser, authorizeRoles(['admin']), getActivityTrends);

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

export default router;