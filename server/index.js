import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { WebSocketServer } from 'ws';

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
  password: 'groot',
  schema: 'public',
});

// Create WebSocket server
const wss = new WebSocketServer({ port: 5001 });

// Store connected admin clients
const adminClients = new Set();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/ws/admin') {
    adminClients.add(ws);
    
    ws.on('close', () => {
      adminClients.delete(ws);
    });
  }
});

// Function to broadcast updates to all admin clients
const broadcastToAdmins = (data) => {
  const message = JSON.stringify(data);
  adminClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

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
    const result = await pool.query(
      'INSERT INTO activities (user_id, role, activity_name) VALUES ($1, $2, $3) RETURNING *',
      [userId, role, activityName]
    );
    
    // Broadcast the new activity to admin clients
    broadcastToAdmins({
      type: 'new_activity',
      activity: result.rows[0]
    });
    
    return result.rows[0];
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Create events table if it doesn't exist
const createEventsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        event_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        location VARCHAR(255),
        event_type VARCHAR(50) NOT NULL,
        organizer_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Events table created or already exists');
  } catch (error) {
    console.error('Error creating events table:', error);
  }
};

// Call the function when the server starts
createEventsTable();

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
      'SELECT * FROM users ORDER BY created_at DESC'
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
      'UPDATE users SET user_status = 0, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
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
      'UPDATE users SET user_status = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
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

// Admin dashboard endpoints
app.get('/api/admin/dashboard', authenticateUser, authorizeRoles(['admin']), async (req, res) => {
  try {
    // Get total users
    const totalUsersResult = await pool.query('SELECT COUNT(*) FROM users WHERE user_status = 1');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Get active users (users who have logged in within the last 24 hours)
    const activeUsersResult = await pool.query(`
      SELECT COUNT(DISTINCT a.user_id) 
      FROM activities a 
      JOIN users u ON a.user_id = u.user_id 
      WHERE a.activity_timestamp > NOW() - INTERVAL '24 hours' 
      AND u.user_status = 1
    `);
    const activeUsers = parseInt(activeUsersResult.rows[0].count);

    // Get total activities
    const totalActivitiesResult = await pool.query('SELECT COUNT(*) FROM activities');
    const totalActivities = parseInt(totalActivitiesResult.rows[0].count);

    // Get recent activities with user details
    const recentActivitiesResult = await pool.query(`
      SELECT 
        a.activity_name,
        a.activity_timestamp,
        u.email,
        u.role,
        up.full_name
      FROM activities a
      JOIN users u ON a.user_id = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      ORDER BY a.activity_timestamp DESC
      LIMIT 10
    `);

    // Get user growth data (last 7 days) from users table
    const userGrowthResult = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as student_count,
        SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) as teacher_count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '7 days'
        AND user_status = 1
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Fill in missing days with 0s
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i)); // oldest to newest
      return date.toISOString().split('T')[0];
    });

    const userGrowthData = last7Days.map(date => {
      const row = userGrowthResult.rows.find(r => {
        return (typeof r.date === 'string' ? r.date : r.date.toISOString().split('T')[0]) === date;
      });
      return {
        date,
        student_count: row ? Number(row.student_count) : 0,
        teacher_count: row ? Number(row.teacher_count) : 0
      };
    });

    // Get user role distribution
    const userDistributionResult = await pool.query(`
      SELECT 
        role,
        CAST(COUNT(*) AS INTEGER) as value
      FROM users
      WHERE user_status = 1
      GROUP BY role
    `);
    
    // Get pending requests
    const pendingRequestsResult = await pool.query(`
      SELECT 
        ur.id,
        ur.request_type,
        ur.request_details,
        ur.request_date,
        u.email,
        up.full_name
      FROM user_requests ur
      JOIN users u ON ur.user_id = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      WHERE ur.status = 'pending'
      ORDER BY ur.request_date DESC
      LIMIT 5
    `);

    // Get registration request status distribution
    const requestStatusResult = await pool.query(`
      SELECT 
        COALESCE(status, 'pending') as status,
        CAST(COUNT(*) AS INTEGER) as value
      FROM registration_requests
      GROUP BY status
    `);

    // Get recent assignments
    const recentAssignmentsResult = await pool.query(`
      SELECT 
        a.assignment_id,
        a.title,
        a.due_date,
        c.class_name,
        co.course_name,
        u.email as teacher_email,
        up.full_name as teacher_name,
        COUNT(sas.id) as total_students,
        COUNT(CASE WHEN sas.status = 'Completed' THEN 1 END) as completed_count
      FROM assignments a
      JOIN class_courses cc ON a.class_course_id = cc.id
      JOIN classes c ON cc.class_id = c.class_id
      JOIN courses co ON cc.course_id = co.course_id
      JOIN users u ON a.created_by_teacher_id = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id
      LEFT JOIN student_assignment_status sas ON a.assignment_id = sas.assignment_id
      GROUP BY a.assignment_id, a.title, a.due_date, c.class_name, co.course_name, u.email, up.full_name
      ORDER BY a.created_at DESC
      LIMIT 5
    `);

    // Get upcoming events
    const upcomingEventsResult = await pool.query(`
      SELECT 
        e.event_id,
        e.title,
        e.description,
        e.event_date as start_date,
        e.event_date as end_date,
        NULL as location,
        'General' as event_type,
        'System' as organizer
      FROM events e
      WHERE e.event_date > NOW()
      ORDER BY e.event_date ASC
      LIMIT 5
    `);

    const responseData = {
      totalUsers,
      activeUsers,
      totalActivities,
      recentActivities: recentActivitiesResult.rows,
      userGrowth: userGrowthData,
      userDistribution: userDistributionResult.rows,
      pendingRequests: pendingRequestsResult.rows,
      requestStatusDistribution: requestStatusResult.rows,
      recentAssignments: recentAssignmentsResult.rows,
      upcomingEvents: upcomingEventsResult.rows
    };

    console.log('Sending dashboard response:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Add event creation endpoint
app.post('/api/admin/events', authenticateUser, authorizeRoles(['admin']), async (req, res) => {
  const { title, description, start_date, end_date, location, event_type } = req.body;
  
  if (!title || !start_date || !end_date || !event_type) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO events (
        title,
        description,
        start_date,
        end_date,
        location,
        event_type,
        organizer_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [title, description, start_date, end_date, location, event_type, req.user.userId]);

    // Broadcast the new event to admin clients
    broadcastToAdmins({
      type: 'new_event',
      event: result.rows[0]
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
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