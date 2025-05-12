import { logActivity } from '../utils/helpers.js';
import User from '../models/User.js';
import RegistrationRequest from '../models/RegistrationRequest.js';
import pool from '../db/config.js';
import Activity from '../models/Activity.js';

export const getRegistrationRequests = async (req, res) => {
  try {
    const requests = await RegistrationRequest.findAll();
    return res.json(requests);
  } catch (error) {
    console.error('Error fetching registration requests:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const approveRegistration = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get the registration request
    const request = await RegistrationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Registration request not found' });
    }
    
    console.log('Registration request found:', request);
    
    // Check if user already exists
    const existingUser = await User.findByEmail(request.username);
    if (existingUser) {
      // Check if this user was properly approved
      const approvedRequest = await pool.query(
        'SELECT * FROM registration_requests WHERE username = $1 AND status = $2',
        [request.username, 'approved']
      );
      
      if (!approvedRequest.rows[0]) {
        // This user exists but wasn't properly approved - remove them
        console.log('Found unauthorized user, removing:', existingUser.user_id);
        await pool.query('DELETE FROM user_profiles WHERE user_id = $1', [existingUser.user_id]);
        await pool.query('DELETE FROM users WHERE user_id = $1', [existingUser.user_id]);
      } else {
        // User exists and was properly approved, just update this request
        await RegistrationRequest.updateStatus(id, 'approved', req.user.email);
        console.log('User already exists and was properly approved, updated registration request status');
        
        // Log activity
        await logActivity(req.user.userId, req.user.role, 'approve_registration');
        console.log('Activity logged');
        
        return res.json({ message: 'Registration request approved (user already exists)' });
      }
    }
    
    // Check for any other pending requests for the same username
    const otherPendingRequests = await pool.query(
      'SELECT * FROM registration_requests WHERE username = $1 AND status = $2 AND id != $3',
      [request.username, 'pending', id]
    );
    
    if (otherPendingRequests.rows.length > 0) {
      // Reject other pending requests
      for (const otherRequest of otherPendingRequests.rows) {
        await RegistrationRequest.updateStatus(otherRequest.id, 'rejected', req.user.email);
      }
      console.log('Rejected other pending requests for the same username');
    }
    
    // Create new user
    const user = await User.create(request.username, request.password, request.role);
    console.log('User created:', user);
    
    // Create user profile
    await pool.query(
      'INSERT INTO user_profiles (user_id, full_name, contact_number) VALUES ($1, $2, $3)',
      [user.user_id, request.full_name, request.contact_number]
    );
    console.log('User profile created');
    
    // Update request status
    await RegistrationRequest.updateStatus(id, 'approved', req.user.email);
    console.log('Registration request status updated');
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'approve_registration');
    console.log('Activity logged');
    
    return res.json({ message: 'Registration request approved' });
  } catch (error) {
    console.error('Error approving registration request:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return res.status(500).json({ 
      message: 'Server error',
      details: error.message 
    });
  }
};

export const rejectRegistration = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Update request status
    await RegistrationRequest.updateStatus(id, 'rejected', req.user.email);
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'reject_registration');
    
    return res.json({ message: 'Registration request rejected' });
  } catch (error) {
    console.error('Error rejecting registration request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let users;
    if (role === 'student') {
      // Only active students
      const result = await pool.query(
        `SELECT u.user_id, u.email, u.role, u.user_status, up.full_name, up.class_id, c.class_name
         FROM users u
         JOIN user_profiles up ON u.user_id = up.user_id
         LEFT JOIN classes c ON up.class_id = c.class_id
         WHERE u.role = 'student' AND u.user_status = 1
         ORDER BY up.full_name ASC`
      );
      users = result.rows;
    } else {
      users = await User.findAll();
    }
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deactivateUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    await User.updateStatus(id, 2); // 2 for suspended
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'deactivate_user');
    
    return res.json({ message: 'User deactivated' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const reactivateUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log('Attempting to reactivate user:', id);

    const user = await User.findById(id);
    if (!user) {
      console.log('User not found:', id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Found user:', user);
    const updatedUser = await User.updateStatus(id, 1); // 1 for active
    console.log('Update result:', updatedUser);

    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to update user status' });
    }
    
    await logActivity(req.user.userId, req.user.role, 'reactivate_user');
    return res.json({ message: 'User reactivated successfully' });
  } catch (error) {
    console.error('Error reactivating user:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      details: error.message 
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // Get total active students
    const studentsResult = await pool.query(
      'SELECT COUNT(*) as count FROM Users WHERE role = $1 AND user_status = 1',
      ['student']
    );
    
    // Get total active teachers
    const teachersResult = await pool.query(
      'SELECT COUNT(*) as count FROM Users WHERE role = $1 AND user_status = 1',
      ['teacher']
    );

    // Get total active admins
    const adminsResult = await pool.query(
      'SELECT COUNT(*) as count FROM Users WHERE role = $1 AND user_status = 1',
      ['admin']
    );
    
    // Get pending registration requests
    const requestsResult = await pool.query(
      'SELECT COUNT(*) as count FROM registration_requests WHERE status = $1',
      ['pending']
    );

    // Calculate overall average attendance for the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const attendanceResult = await pool.query(
      `SELECT 
        COUNT(CASE WHEN attendance_status = 1 THEN 1 END) as present_count,
        COUNT(*) as total_count
      FROM attendance 
      WHERE attendance_date >= $1`,
      [oneMonthAgo.toISOString().split('T')[0]]
    );

    const presentCount = parseInt(attendanceResult.rows[0].present_count);
    const totalCount = parseInt(attendanceResult.rows[0].total_count);
    const averageAttendance = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    const stats = {
      totalStudents: parseInt(studentsResult.rows[0].count),
      totalTeachers: parseInt(teachersResult.rows[0].count),
      totalAdmins: parseInt(adminsResult.rows[0].count),
      pendingRequests: parseInt(requestsResult.rows[0].count),
      averageAttendance
    };
    
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const { role, classId, userId } = req.query;
    const activities = await Activity.getRecentActivities({ role, classId, userId });
    return res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return res.status(500).json({ message: 'Failed to fetch recent activities' });
  }
};

export const getToolUsageStats = async (req, res) => {
  try {
    const stats = await Activity.getToolUsageStats();
    
    // Transform activity names to readable labels
    const transformedStats = stats.map(stat => ({
      label: stat.activity_name.replace('use_', '').split('_').map(
        word => word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      count: parseInt(stat.usage_count)
    }));
    
    return res.json(transformedStats);
  } catch (error) {
    console.error('Error fetching tool usage stats:', error);
    return res.status(500).json({ message: 'Failed to fetch tool usage statistics' });
  }
};

export const getActivityTrends = async (req, res) => {
  try {
    const activityTrends = await Activity.getDailyRegistrationCounts(7);
    return res.json(activityTrends);
  } catch (error) {
    console.error('Error fetching activity trends:', error);
    return res.status(500).json({ message: 'Failed to fetch activity trends' });
  }
};

export const getFilteredAttendance = async (req, res) => {
  try {
    const { role, userId, classId, timeRange } = req.query;
    
    // Build the base query
    let query = `
      SELECT 
        COUNT(CASE WHEN attendance_status = 1 THEN 1 END) as present_count,
        COUNT(*) as total_count
      FROM attendance a
      JOIN users u ON a.user_id = u.user_id
      LEFT JOIN class_courses cc ON a.class_course_id = cc.id
      WHERE 1=1 AND u.user_status = 1
    `;
    
    const queryParams = [];
    let paramIndex = 1;

    // Add role filter
    if (role && role !== 'all') {
      query += ` AND a.role = $${paramIndex}`;
      queryParams.push(role);
      paramIndex++;
    }

    // Add user filter
    if (userId) {
      query += ` AND user_id = $${paramIndex}`;
      queryParams.push(userId);
      paramIndex++;
    }

    // Add class filter
    if (classId) {
      query += ` AND cc.class_id = $${paramIndex}`;
      queryParams.push(classId);
      paramIndex++;
    }

    // Add time range filter
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'semester':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1)); // Default to last month
    }

    query += ` AND attendance_date >= $${paramIndex}`;
    queryParams.push(startDate.toISOString().split('T')[0]);

    // Execute the query
    const result = await pool.query(query, queryParams);
    
    // Calculate average attendance
    const presentCount = parseInt(result.rows[0].present_count);
    const totalCount = parseInt(result.rows[0].total_count);
    const averageAttendance = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    return res.json({ averageAttendance });
  } catch (error) {
    console.error('Error calculating filtered attendance:', error);
    return res.status(500).json({ message: 'Failed to calculate attendance' });
  }
};

export const assignTeacherToClassCourse = async (req, res) => {
  console.log('assignTeacherToClassCourse called, body:', req.body);
  const { teacherId, classId, courseId, startDate, endDate } = req.body;
  if (!teacherId || !classId || !courseId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    console.log('Assigning teacherId:', teacherId, 'to classId:', classId, 'courseId:', courseId);
    // Get class and course names for logging
    const classResult = await pool.query('SELECT class_name FROM classes WHERE class_id = $1', [classId]);
    const courseResult = await pool.query('SELECT course_name FROM courses WHERE course_id = $1', [courseId]);
    const teacherResult = await pool.query('SELECT full_name FROM user_profiles WHERE user_id = $1', [teacherId]);
    
    const className = classResult.rows[0]?.class_name;
    const courseName = courseResult.rows[0]?.course_name;
    const teacherName = teacherResult.rows[0]?.full_name;

    // Create the assignment
    await pool.query(
      'INSERT INTO class_courses (class_id, course_id, teacher_id, start_date, end_date) VALUES ($1, $2, $3, $4, $5)',
      [classId, courseId, teacherId, startDate, endDate]
    );

    // Log the activity
    await logActivity(
      req.user.userId,
      req.user.role,
      'assign_teacher',
      `Assigned ${teacherName} to teach ${courseName} for ${className} from ${startDate} to ${endDate}`
    );

    return res.status(201).json({ message: 'Teacher assigned to class/course successfully' });
  } catch (error) {
    console.error('Error assigning teacher:', error);
    return res.status(500).json({ message: 'Failed to assign teacher' });
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes ORDER BY class_name');
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return res.status(500).json({ message: 'Failed to fetch classes' });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY course_name');
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

export const getAllTeacherAssignments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cc.id, cc.class_id, cc.course_id, cc.teacher_id, cc.start_date, cc.end_date,
             c.class_name, co.course_name, up.full_name as teacher_name, us.email as teacher_email
      FROM class_courses cc
      JOIN classes c ON cc.class_id = c.class_id
      JOIN courses co ON cc.course_id = co.course_id
      JOIN user_profiles up ON cc.teacher_id = up.user_id
      JOIN users us ON cc.teacher_id = us.user_id
      ORDER BY cc.start_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching teacher assignments:', error);
    res.status(500).json({ message: 'Failed to fetch teacher assignments' });
  }
};

export const deleteTeacherAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    // Get assignment details before deleting
    const assignmentResult = await pool.query(`
      SELECT 
        c.class_name,
        co.course_name,
        u.full_name as teacher_name,
        cc.start_date,
        cc.end_date
      FROM class_courses cc
      JOIN classes c ON cc.class_id = c.class_id
      JOIN courses co ON cc.course_id = co.course_id
      JOIN user_profiles u ON cc.teacher_id = u.user_id
      WHERE cc.id = $1
    `, [id]);

    const assignment = assignmentResult.rows[0];
    
    // Delete the assignment
    await pool.query('DELETE FROM class_courses WHERE id = $1', [id]);

    // Log the activity
    if (assignment) {
      await logActivity(
        req.user.userId,
        req.user.role,
        'remove_teacher_assignment',
        `Removed ${assignment.teacher_name}'s assignment to teach ${assignment.course_name} for ${assignment.class_name}`
      );
    }

    res.json({ message: 'Assignment removed' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: 'Failed to delete assignment' });
  }
};

export const updateTeacherAssignment = async (req, res) => {
  const { id } = req.params;
  const { classId, courseId, teacherId, startDate, endDate } = req.body;
  try {
    // Get old assignment details
    const oldAssignmentResult = await pool.query(`
      SELECT 
        c.class_name as old_class,
        co.course_name as old_course,
        u.full_name as old_teacher,
        cc.start_date as old_start,
        cc.end_date as old_end
      FROM class_courses cc
      JOIN classes c ON cc.class_id = c.class_id
      JOIN courses co ON cc.course_id = co.course_id
      JOIN user_profiles u ON cc.teacher_id = u.user_id
      WHERE cc.id = $1
    `, [id]);

    // Get new assignment details
    const newClassResult = await pool.query('SELECT class_name FROM classes WHERE class_id = $1', [classId]);
    const newCourseResult = await pool.query('SELECT course_name FROM courses WHERE course_id = $1', [courseId]);
    const newTeacherResult = await pool.query('SELECT full_name FROM user_profiles WHERE user_id = $1', [teacherId]);

    // Update the assignment
    await pool.query(
      `UPDATE class_courses SET class_id = $1, course_id = $2, teacher_id = $3, start_date = $4, end_date = $5 WHERE id = $6`,
      [classId, courseId, teacherId, startDate, endDate, id]
    );

    // Log the activity
    const oldAssignment = oldAssignmentResult.rows[0];
    const newClassName = newClassResult.rows[0]?.class_name;
    const newCourseName = newCourseResult.rows[0]?.course_name;
    const newTeacherName = newTeacherResult.rows[0]?.full_name;

    await logActivity(
      req.user.userId,
      req.user.role,
      'update_teacher_assignment',
      `Updated assignment: ${oldAssignment.old_teacher} teaching ${oldAssignment.old_course} for ${oldAssignment.old_class} to ${newTeacherName} teaching ${newCourseName} for ${newClassName}`
    );

    res.json({ message: 'Assignment updated' });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Failed to update assignment' });
  }
};

export const allocateStudentToClass = async (req, res) => {
  const { studentId, classId } = req.body;
  if (!studentId || !classId) {
    return res.status(400).json({ message: 'Student ID and Class ID are required' });
  }
  try {
    // Get student and class details for logging
    const studentResult = await pool.query(
      'SELECT full_name FROM user_profiles WHERE user_id = $1',
      [studentId]
    );
    const classResult = await pool.query(
      'SELECT class_name FROM classes WHERE class_id = $1',
      [classId]
    );
    const studentName = studentResult.rows[0]?.full_name;
    const className = classResult.rows[0]?.class_name;
    // Update student's class
    await pool.query(
      'UPDATE user_profiles SET class_id = $1 WHERE user_id = $2',
      [classId, studentId]
    );
    // Log the activity
    await logActivity(
      req.user.userId,
      req.user.role,
      'allocate_student',
      `Allocated ${studentName} to class ${className}`
    );
    res.json({ message: 'Student allocated to class successfully' });
  } catch (error) {
    console.error('Error allocating student to class:', error);
    res.status(500).json({ message: 'Failed to allocate student to class' });
  }
};

export const removeStudentAllocation = async (req, res) => {
  const { studentId } = req.params;
  try {
    // Get student details for logging
    const studentResult = await pool.query(
      `SELECT up.full_name, c.class_name 
       FROM user_profiles up
       LEFT JOIN classes c ON up.class_id = c.class_id
       WHERE up.user_id = $1`,
      [studentId]
    );
    const studentName = studentResult.rows[0]?.full_name;
    const className = studentResult.rows[0]?.class_name;
    // Remove student from class
    await pool.query(
      'UPDATE user_profiles SET class_id = NULL WHERE user_id = $1',
      [studentId]
    );
    // Log the activity
    await logActivity(
      req.user.userId,
      req.user.role,
      'remove_student_allocation',
      `Removed allocation of ${studentName} from class ${className}`
    );
    res.json({ message: 'Student allocation removed from class successfully' });
  } catch (error) {
    console.error('Error removing student allocation from class:', error);
    res.status(500).json({ message: 'Failed to remove student allocation from class' });
  }
};