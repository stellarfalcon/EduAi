import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Database connection setup
const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '68NITec@2011',
  schema: 'edu_platform',
});

// Utility functions
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.user_id, 
      email: user.email, 
      role: user.role 
    }, 
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Authentication middleware
const authenticateUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Authorization middleware
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// Log activity
const logActivity = async (userId, role, activityName) => {
  try {
    await pool.query(
      'INSERT INTO activities (user_id, role, activity_name) VALUES ($1, $2, $3)',
      [userId, role, activityName]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role } = req.body;
  
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (!['student', 'teacher'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  
  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM Users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Check if registration request already exists
    const existingRequest = await pool.query(
      'SELECT * FROM registration_requests WHERE username = $1',
      [email]
    );
    
    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ message: 'Registration request already submitted' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create registration request
    await pool.query(
      'INSERT INTO registration_requests (username, password, role) VALUES ($1, $2, $3)',
      [email, hashedPassword, role]
    );
    
    return res.status(201).json({ message: 'Registration request submitted successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    // Check if user exists
    const result = await pool.query(
      'SELECT * FROM Users WHERE email = $1 AND user_status = 1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Log login activity
    await logActivity(user.user_id, user.role, 'login');
    
    // Generate token
    const token = generateToken(user);
    
    return res.json({ 
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/verify', authenticateUser, (req, res) => {
  return res.json({ user: req.user });
});

// Admin routes
app.get('/api/admin/registration-requests', authenticateUser, authorizeRoles(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM registration_requests ORDER BY created_at DESC'
    );
    
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching registration requests:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/registration-requests/:id/approve', authenticateUser, authorizeRoles(['admin']), async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get the registration request
    const requestResult = await pool.query(
      'SELECT * FROM registration_requests WHERE id = $1',
      [id]
    );
    
    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Registration request not found' });
    }
    
    const request = requestResult.rows[0];
    
    // Create user
    const userResult = await pool.query(
      'INSERT INTO Users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
      [request.username, request.password, request.role]
    );
    
    const user = userResult.rows[0];
    
    // Update request status
    await pool.query(
      'UPDATE registration_requests SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['approved', req.user.email, id]
    );
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'approve_registration');
    
    return res.json({ message: 'Registration request approved' });
  } catch (error) {
    console.error('Error approving registration request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/registration-requests/:id/reject', authenticateUser, authorizeRoles(['admin']), async (req, res) => {
  const { id } = req.params;
  
  try {
    // Update request status
    await pool.query(
      'UPDATE registration_requests SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['rejected', req.user.email, id]
    );
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'reject_registration');
    
    return res.json({ message: 'Registration request rejected' });
  } catch (error) {
    console.error('Error rejecting registration request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/users', authenticateUser, authorizeRoles(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "Users" ORDER BY "createdAt" DESC'
    );
    
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/users/:id/deactivate', authenticateUser, authorizeRoles(['admin']), async (req, res) => {
  const { id } = req.params;
  
  try {
    // Update user status
    await pool.query(
      'UPDATE school_mgmt.Users SET is_deleted_user = true, "updatedAt" = CURRENT_TIMESTAMP WHERE user_id = $1',
      [id]
    );
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'deactivate_user');
    
    return res.json({ message: 'User deactivated' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/users/:id/reactivate', authenticateUser, authorizeRoles(['admin']), async (req, res) => {
  const { id } = req.params;
  
  try {
    // Update user status
    await pool.query(
      'UPDATE "Users" SET is_deleted_user = false, "updatedAt" = CURRENT_TIMESTAMP WHERE user_id = $1',
      [id]
    );
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'reactivate_user');
    
    return res.json({ message: 'User reactivated' });
  } catch (error) {
    console.error('Error reactivating user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Teacher routes
app.get('/api/teacher/assignments', authenticateUser, authorizeRoles(['teacher']), async (req, res) => {
  try {
    // This would fetch assignments created by the teacher
    // For demo purposes, we'll return mock data
    
    const assignments = [
      {
        id: 1,
        title: 'Photosynthesis Lab Report',
        description: 'Write a lab report on the photosynthesis experiment conducted in class.',
        due_date: '2025-03-10',
        class_id: 1,
        class_name: '9th Grade - Section A',
        course_id: 1,
        course_name: 'Biology',
        total_students: 25,
        submitted_count: 18,
        created_at: '2025-02-25',
      },
      // Add more mock assignments as needed
    ];
    
    return res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/teacher/assignments', authenticateUser, authorizeRoles(['teacher']), async (req, res) => {
  const { title, description, dueDate, classId, courseId } = req.body;
  
  if (!title || !description || !dueDate || !classId || !courseId) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    // This would create a new assignment
    // For demo purposes, we'll return mock data
    
    const newAssignment = {
      id: Date.now(),
      title,
      description,
      due_date: dueDate,
      class_id: classId,
      course_id: courseId,
      created_at: new Date().toISOString(),
    };
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'create_assignment');
    
    return res.status(201).json(newAssignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Student routes
app.get('/api/student/assignments', authenticateUser, authorizeRoles(['student']), async (req, res) => {
  try {
    // This would fetch assignments for the student
    // For demo purposes, we'll return mock data
    
    const assignments = [
      {
        id: 1,
        title: 'Biology Report: Cellular Respiration',
        description: 'Write a detailed report on the cellular respiration process, including the stages and energy production.',
        course_name: 'Biology',
        teacher_name: 'Dr. Smith',
        due_date: '2025-03-10',
        status: 'In Progress',
      },
      // Add more mock assignments as needed
    ];
    
    return res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/student/assignments/:id/status', authenticateUser, authorizeRoles(['student']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['Not Started', 'In Progress', 'Completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  try {
    // This would update the assignment status
    // For demo purposes, we'll return mock data
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'update_assignment_status');
    
    return res.json({ message: 'Assignment status updated' });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
} else {
  // Handle all other routes in development
  app.get('*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;