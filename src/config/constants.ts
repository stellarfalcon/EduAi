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
    { name: 'Teacher Class Allocation', path: '/admin/teacher-assignments', icon: 'Presentation' },
    { name: 'Student Class Allocation', path: '/admin/student-class-allocation', icon: 'Users' },
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

// Gemini AI Configuration
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Keep the mock data for reference
export const MOCK_RESPONSES = {
  photosynthesis: 'Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. During photosynthesis, plants take in carbon dioxide (CO2) and water (H2O) from the air and soil. Within the plant cell, the water is oxidized, meaning it loses electrons, while the carbon dioxide is reduced, meaning it gains electrons. This transforms the water into oxygen and the carbon dioxide into glucose (a simple sugar). The plant then releases the oxygen back into the air, and stores energy as glucose molecules. The equation for photosynthesis is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2',
  quadratic: 'A quadratic equation has the form ax² + bx + c = 0 where a ≠ 0. To solve a quadratic equation, you can use the quadratic formula:\n\nx = (-b ± √(b² - 4ac)) / 2a\n\nWhere:\n- a, b, and c are the coefficients in the equation\n- The ± symbol indicates that there are two solutions: one with addition and one with subtraction'
};