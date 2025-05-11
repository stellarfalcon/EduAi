import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';

// Auth components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AuthLayout from './layouts/AuthLayout';

// Admin components
import AdminDashboard from './pages/admin/Dashboard';
import RegistrationRequests from './pages/admin/RegistrationRequests';
import AdminUsers from './pages/admin/Users';
import AdminLayout from './layouts/AdminLayout';
import TeacherAssignments from './pages/admin/TeacherAssignments';

// Teacher components
import TeacherDashboard from './pages/teacher/Dashboard';
import LessonPlanner from './pages/teacher/LessonPlanner';
import Assignments from './pages/teacher/Assignments';
import TeacherLayout from './layouts/TeacherLayout';

// Student components
import StudentDashboard from './pages/student/Dashboard';
import StudentAssignments from './pages/student/Assignments';
import StudyAssistant from './pages/student/StudyAssistant';
import StudentLayout from './layouts/StudentLayout';

// Context and hooks
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Admin Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/registration-requests" element={<RegistrationRequests />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/teacher-assignments" element={<TeacherAssignments />} />
          </Route>

          {/* Teacher Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/lesson-planner" element={<LessonPlanner />} />
            <Route path="/teacher/assignments" element={<Assignments />} />
          </Route>

          {/* Student Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/assignments" element={<StudentAssignments />} />
            <Route path="/student/study-assistant" element={<StudyAssistant />} />
          </Route>

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;