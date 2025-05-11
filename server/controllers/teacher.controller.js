import { logActivity } from '../utils/helpers.js';
import Assignment from '../models/Assignment.js';
import pool from '../db/config.js';

export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.findByTeacher(req.user.userId);
    return res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createAssignment = async (req, res) => {
  const { title, description, dueDate, classId, courseId } = req.body;
  
  if (!title || !description || !dueDate || !classId || !courseId) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      classId,
      courseId,
      teacherId: req.user.userId
    });
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'create_assignment');
    
    // Fetch the full assignment row with all fields and correct keys
    const result = await pool.query(
      `SELECT a.assignment_id AS id, a.title, a.description, 
              a.due_date AS dueDate, 
              cc.class_id, c.class_name AS className, cc.course_id, co.course_name AS courseName,
              a.created_at, 
              0 as totalStudents, 0 as submittedCount
       FROM assignments a
       JOIN class_courses cc ON a.class_course_id = cc.id
       JOIN classes c ON cc.class_id = c.class_id
       JOIN courses co ON cc.course_id = co.course_id
       WHERE a.assignment_id = $1`,
      [assignment.assignment_id]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getTeacherClasses = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const result = await pool.query(
      `SELECT DISTINCT c.class_id, c.class_name
       FROM class_courses cc
       JOIN classes c ON cc.class_id = c.class_id
       WHERE cc.teacher_id = $1`,
      [teacherId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    res.status(500).json({ message: 'Failed to fetch classes' });
  }
};

export const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const result = await pool.query(
      `SELECT u.user_id, u.email, up.full_name
       FROM users u
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.role = 'student' AND up.class_id = $1`,
      [classId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.user_id,
        u.email,
        up.full_name,
        up.class_id,
        c.class_name
      FROM users u
      JOIN user_profiles up ON u.user_id = up.user_id
      LEFT JOIN classes c ON up.class_id = c.class_id
      WHERE u.role = 'student' AND u.user_status = 1
      ORDER BY up.full_name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT class_id, class_name
      FROM classes
      ORDER BY class_name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Failed to fetch classes' });
  }
};

export const assignStudentToClass = async (req, res) => {
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
      'assign_student',
      `Assigned ${studentName} to class ${className}`
    );

    res.json({ message: 'Student assigned to class successfully' });
  } catch (error) {
    console.error('Error assigning student to class:', error);
    res.status(500).json({ message: 'Failed to assign student to class' });
  }
};

export const removeStudentFromClass = async (req, res) => {
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
      'remove_student',
      `Removed ${studentName} from class ${className}`
    );

    res.json({ message: 'Student removed from class successfully' });
  } catch (error) {
    console.error('Error removing student from class:', error);
    res.status(500).json({ message: 'Failed to remove student from class' });
  }
};

// Teacher Dashboard: Get stats (students, courses, assignments, avg attendance)
export const getDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    // Total students assigned to this teacher's classes
    const studentsResult = await pool.query(
      `SELECT COUNT(DISTINCT up.user_id) as count
       FROM user_profiles up
       JOIN classes c ON up.class_id = c.class_id
       JOIN class_courses cc ON c.class_id = cc.class_id
       WHERE cc.teacher_id = $1`,
      [teacherId]
    );
    // Total courses taught by this teacher
    const coursesResult = await pool.query(
      `SELECT COUNT(DISTINCT cc.course_id) as count
       FROM class_courses cc
       WHERE cc.teacher_id = $1`,
      [teacherId]
    );
    // Completed assignments (for this teacher)
    const assignmentsResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM assignments
       WHERE created_by_teacher_id = $1`,
      [teacherId]
    );
    // Average attendance for this teacher's classes (last 30 days)
    const attendanceResult = await pool.query(
      `SELECT 
        COUNT(CASE WHEN a.attendance_status = 1 THEN 1 END) as present_count,
        COUNT(*) as total_count
      FROM attendance a
      JOIN class_courses cc ON a.class_course_id = cc.id
      WHERE cc.teacher_id = $1
        AND a.attendance_date >= CURRENT_DATE - INTERVAL '30 days'`,
      [teacherId]
    );
    const presentCount = parseInt(attendanceResult.rows[0].present_count);
    const totalCount = parseInt(attendanceResult.rows[0].total_count);
    const avgAttendance = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
    return res.json({
      totalStudents: parseInt(studentsResult.rows[0].count),
      totalCourses: parseInt(coursesResult.rows[0].count),
      completedAssignments: parseInt(assignmentsResult.rows[0].count),
      avgAttendance
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard stats:', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

// Teacher Dashboard: Get students with performance (attendance & performance %)
export const getStudentsPerformance = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    // Get all students in this teacher's classes
    const studentsResult = await pool.query(
      `SELECT DISTINCT up.user_id, up.full_name
       FROM user_profiles up
       JOIN classes c ON up.class_id = c.class_id
       JOIN class_courses cc ON c.class_id = cc.class_id
       WHERE cc.teacher_id = $1
       ORDER BY up.full_name ASC`,
      [teacherId]
    );
    const students = studentsResult.rows;
    // For each student, get attendance % and performance (completion rate)
    const data = [];
    for (const student of students) {
      // Attendance % (last 30 days)
      const attendanceResult = await pool.query(
        `SELECT 
          COUNT(CASE WHEN attendance_status = 1 THEN 1 END) as present_count,
          COUNT(*) as total_count
         FROM attendance
         WHERE user_id = $1 AND attendance_date >= CURRENT_DATE - INTERVAL '30 days'`,
        [student.user_id]
      );
      const presentCount = parseInt(attendanceResult.rows[0].present_count);
      const totalCount = parseInt(attendanceResult.rows[0].total_count);
      const attendance = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
      // Performance: completion rate (percentage of assignments completed)
      const perfResult = await pool.query(
        `SELECT COUNT(*) FILTER (WHERE status = 'Completed')::float / NULLIF(COUNT(*), 0) * 100 as completion_rate
         FROM student_assignment_status sas
         JOIN assignments a ON sas.assignment_id = a.assignment_id
         WHERE sas.student_id = $1 AND a.created_by_teacher_id = $2`,
        [student.user_id, teacherId]
      );
      const performance = perfResult.rows[0].completion_rate !== null ? Math.round(perfResult.rows[0].completion_rate) : 0;
      data.push({
        user_id: student.user_id,
        full_name: student.full_name,
        attendance,
        performance
      });
    }
    return res.json(data);
  } catch (error) {
    console.error('Error fetching students performance:', error);
    return res.status(500).json({ message: 'Failed to fetch students performance' });
  }
};

// Helper: Map activity_name to user-friendly description for teacher dashboard
function getTeacherActivityDescription(activityName) {
  if (/^(GET|POST|PUT|DELETE|PATCH) \/.*/i.test(activityName)) return null;
  switch (activityName.toLowerCase()) {
    case 'login':
      return 'Logged into the system';
    case 'submit_assignment':
      return 'Submitted an assignment';
    case 'create_assignment':
      return 'Created a new assignment';
    case 'mark_attendance':
      return 'Marked attendance';
    case 'use_ai_tool':
      return 'Used an AI tool';
    case 'assign_student':
      return 'Assigned a student to a class';
    case 'remove_student':
      return 'Removed a student from a class';
    // Add more as needed for teacher/student actions
    default:
      return null;
  }
}

// Teacher Dashboard: Get recent activities (last 7 days, for this teacher)
export const getRecentActivities = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    // Get user_ids of students in classes taught by this teacher
    const studentsResult = await pool.query(
      `SELECT DISTINCT up.user_id
       FROM user_profiles up
       JOIN classes c ON up.class_id = c.class_id
       JOIN class_courses cc ON c.class_id = cc.class_id
       WHERE cc.teacher_id = $1`,
      [teacherId]
    );
    const studentIds = studentsResult.rows.map(row => row.user_id);
    // Get teacher's own activities
    const teacherActivities = await pool.query(
      `SELECT a.activity_name AS type, a.activity_timestamp AS date, 'self' AS actor_type,
              a.role, COALESCE(up.full_name, u.email) as user_name, a.user_id
       FROM activities a
       LEFT JOIN users u ON a.user_id = u.user_id
       LEFT JOIN user_profiles up ON u.user_id = up.user_id
       WHERE a.user_id = $1 AND a.role = 'teacher'
         AND a.activity_timestamp >= CURRENT_DATE - INTERVAL '7 days'`,
      [teacherId]
    );
    // Get activities of students in teacher's classes
    let studentActivities = { rows: [] };
    if (studentIds.length > 0) {
      studentActivities = await pool.query(
        `SELECT a.activity_name AS type, a.activity_timestamp AS date, 'student' AS actor_type,
                a.role, COALESCE(up.full_name, u.email) as user_name, a.user_id
         FROM activities a
         LEFT JOIN users u ON a.user_id = u.user_id
         LEFT JOIN user_profiles up ON u.user_id = up.user_id
         WHERE a.user_id = ANY($1) AND a.role = 'student'
           AND a.activity_timestamp >= CURRENT_DATE - INTERVAL '7 days'`,
        [studentIds]
      );
    }
    // Merge, sort, and map to user-friendly descriptions
    const allActivities = [
      ...teacherActivities.rows,
      ...studentActivities.rows
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    const filteredActivities = allActivities
      .map(a => ({
        ...a,
        description: getTeacherActivityDescription(a.type)
      }))
      .filter(a => a.description);
    return res.json(filteredActivities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return res.status(500).json({ message: 'Failed to fetch recent activities' });
  }
};

// Teacher Dashboard: Get upcoming events (next 30 days, for all teachers)
export const getUpcomingEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT event_id, title, description, event_date
       FROM events
       WHERE event_date >= CURRENT_DATE AND event_date <= CURRENT_DATE + INTERVAL '30 days'
       ORDER BY event_date ASC
       LIMIT 20`
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return res.status(500).json({ message: 'Failed to fetch upcoming events' });
  }
};

export const checkTeacherAttendance = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];
    const check = await pool.query(
      `SELECT * FROM attendance WHERE user_id = $1 AND role = 'teacher' AND attendance_date = $2`,
      [teacherId, today]
    );
    return res.json({ marked: check.rows.length > 0 });
  } catch (error) {
    console.error('Error checking teacher attendance:', error);
    return res.status(500).json({ message: 'Failed to check attendance' });
  }
};

export const getAttendanceStats = async (req, res) => {
  try {
    const { classId, studentId } = req.query;
    let result;
    if (studentId) {
      // For a student
      result = await pool.query(
        `SELECT 
          COUNT(CASE WHEN attendance_status = 1 THEN 1 END) as present,
          COUNT(CASE WHEN attendance_status = 0 THEN 1 END) as absent,
          COUNT(CASE WHEN attendance_status = 2 THEN 1 END) as excused,
          COUNT(*) as total
         FROM attendance
         WHERE user_id = $1`,
        [studentId]
      );
    } else if (classId) {
      // For a class (all students in class)
      result = await pool.query(
        `SELECT 
          COUNT(CASE WHEN a.attendance_status = 1 THEN 1 END) as present,
          COUNT(CASE WHEN a.attendance_status = 0 THEN 1 END) as absent,
          COUNT(CASE WHEN a.attendance_status = 2 THEN 1 END) as excused,
          COUNT(*) as total
         FROM attendance a
         JOIN user_profiles up ON a.user_id = up.user_id
         WHERE up.class_id = $1 AND a.role = 'student'`,
        [classId]
      );
    } else {
      return res.status(400).json({ message: 'classId or studentId required' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return res.status(500).json({ message: 'Failed to fetch attendance stats' });
  }
};

export const getAverageAttendance = async (req, res) => {
  try {
    const { classId, studentId } = req.query;
    let result;
    if (studentId) {
      result = await pool.query(
        `SELECT 
          COUNT(CASE WHEN attendance_status = 1 THEN 1 END) as present,
          COUNT(*) as total
         FROM attendance
         WHERE user_id = $1`,
        [studentId]
      );
    } else if (classId) {
      result = await pool.query(
        `SELECT 
          COUNT(CASE WHEN a.attendance_status = 1 THEN 1 END) as present,
          COUNT(*) as total
         FROM attendance a
         JOIN user_profiles up ON a.user_id = up.user_id
         WHERE up.class_id = $1 AND a.role = 'student'`,
        [classId]
      );
    } else {
      return res.status(400).json({ message: 'classId or studentId required' });
    }
    const present = parseInt(result.rows[0].present);
    const total = parseInt(result.rows[0].total);
    const average = total > 0 ? Math.round((present / total) * 100) : 0;
    return res.json({ average });
  } catch (error) {
    console.error('Error fetching average attendance:', error);
    return res.status(500).json({ message: 'Failed to fetch average attendance' });
  }
};

export const markTeacherAttendance = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];
    // Check if already marked
    const check = await pool.query(
      `SELECT * FROM attendance WHERE user_id = $1 AND role = 'teacher' AND attendance_date = $2`,
      [teacherId, today]
    );
    if (check.rows.length > 0) {
      return res.status(400).json({ message: 'Attendance already marked for today.' });
    }
    await pool.query(
      `INSERT INTO attendance (user_id, role, attendance_date, attendance_status) VALUES ($1, 'teacher', $2, 1)`,
      [teacherId, today]
    );
    return res.json({ message: 'Attendance marked as present for today.' });
  } catch (error) {
    console.error('Error marking teacher attendance:', error);
    return res.status(500).json({ message: 'Failed to mark attendance' });
  }
};

export const getAllCoursesForTeacher = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const result = await pool.query(
      `SELECT DISTINCT co.course_id, co.course_name
       FROM class_courses cc
       JOIN courses co ON cc.course_id = co.course_id
       WHERE cc.teacher_id = $1
       ORDER BY co.course_name ASC`,
      [teacherId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

export const updateAssignment = async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, classId, courseId } = req.body;
  try {
    // Update the assignment
    const result = await pool.query(
      `UPDATE assignments
       SET title = $1, description = $2, due_date = $3
       WHERE assignment_id = $4
       RETURNING *`,
      [title, description, dueDate, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    // Optionally, update class_course_id if classId or courseId changed
    if (classId && courseId) {
      const ccResult = await pool.query(
        'SELECT id FROM class_courses WHERE class_id = $1 AND course_id = $2 AND teacher_id = $3',
        [classId, courseId, req.user.userId]
      );
      if (ccResult.rows.length > 0) {
        await pool.query(
          'UPDATE assignments SET class_course_id = $1 WHERE assignment_id = $2',
          [ccResult.rows[0].id, id]
        );
      }
    }
    // Return the updated assignment in the same format as findByTeacher
    const updated = await pool.query(
      `SELECT a.assignment_id AS id, a.title, a.description, a.due_date AS dueDate, 
              cc.class_id, c.class_name AS className, cc.course_id, co.course_name AS courseName,
              a.created_at, 
              0 as totalStudents, 0 as submittedCount
       FROM assignments a
       JOIN class_courses cc ON a.class_course_id = cc.id
       JOIN classes c ON cc.class_id = c.class_id
       JOIN courses co ON cc.course_id = co.course_id
       WHERE a.assignment_id = $1`,
      [id]
    );
    res.json(updated.rows[0]);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Failed to update assignment' });
  }
};