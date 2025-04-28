export const API_URL = 'http://localhost:5000/api';

// Activity types for logging
export const ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  CREATE_ASSIGNMENT: 'create_assignment',
  SUBMIT_ASSIGNMENT: 'submit_assignment',
  USE_AI_TOOL: 'use_ai_tool',
};

// Status constants
export const STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  NOT_ATTEMPTED: 'Not Attempted',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

// Attendance status
export const ATTENDANCE = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  EXCUSED: 'Excused',
};

// Routes config for sidebar navigation
export const ROUTES = {
  ADMIN: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
    { name: 'Registration Requests', path: '/admin/registration-requests', icon: 'UserPlus' },
    { name: 'Users', path: '/admin/users', icon: 'Users' },
  ],
  TEACHER: [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: 'LayoutDashboard' },
    { name: 'Lesson Planner', path: '/teacher/lesson-planner', icon: 'Book' },
    { name: 'Assignments', path: '/teacher/assignments', icon: 'FileText' },
  ],
  STUDENT: [
    { name: 'Dashboard', path: '/student/dashboard', icon: 'LayoutDashboard' },
    { name: 'Assignments', path: '/student/assignments', icon: 'FileText' },
    { name: 'Study Assistant', path: '/student/study-assistant', icon: 'Bot' },
  ],
};