import { logActivity } from '../utils/helpers.js';
import Assignment from '../models/Assignment.js';
import Class from '../models/Class.js';
import pool from '../db/config.js';

export const getClasses = async (req, res) => {
  try {
    const classes = await Class.findByStudent(req.user.userId);
    return res.json(classes);
  } catch (error) {
    console.error('Error fetching student classes:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getClassAssignments = async (req, res) => {
  try {
    const { classId } = req.params;
    const assignments = await Assignment.findByClassAndStudent(classId, req.user.userId);
    return res.json(assignments);
  } catch (error) {
    console.error('Error fetching class assignments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.findByStudent(req.user.userId);
    return res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify the assignment belongs to the student
    const studentAssignments = await Assignment.findByStudent(req.user.userId);
    if (!studentAssignments.some(a => a.id === parseInt(id))) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    await Assignment.updateStatus(id, status);
    
    // Log the activity
    await logActivity({
      userId: req.user.userId,
      activityType: 'assignment_status_update',
      description: `Updated assignment "${assignment.title}" status to ${status}`,
      actorType: 'student'
    });

    return res.json({ message: 'Assignment status updated successfully' });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get enrolled classes count
    const enrolledClassesResult = await pool.query(
      'SELECT COUNT(*) as count FROM user_profiles WHERE user_id = $1 AND class_id IS NOT NULL AND is_active_student = true',
      [userId]
    );

    // Get completed assignments count
    const completedAssignmentsResult = await pool.query(
      'SELECT COUNT(*) as count FROM student_assignment_status WHERE student_id = $1 AND status = $2',
      [userId, 'Completed']
    );

    // Get total assignments count
    const totalAssignmentsResult = await pool.query(
      'SELECT COUNT(*) as count FROM student_assignment_status WHERE student_id = $1',
      [userId]
    );

    // Calculate assignment completion rate
    const completed = parseInt(completedAssignmentsResult.rows[0].count, 10) || 0;
    const total = parseInt(totalAssignmentsResult.rows[0].count, 10) || 0;
    const assignmentCompletionRate = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0;

    // Get attendance percentage
    const attendanceResult = await pool.query(
      `SELECT 
        ROUND((COUNT(CASE WHEN attendance_status = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(*),0)), 1) as percentage
       FROM attendance
       WHERE user_id = $1 AND role = 'student'`,
      [userId]
    );

    return res.json({
      enrolledCourses: enrolledClassesResult.rows[0].count || 0,
      completedAssignments: completed,
      attendance: attendanceResult.rows[0].percentage || 0,
      assignmentCompletionRate
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentCourses = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Get the student's class_id
    const classResult = await pool.query(
      'SELECT class_id FROM user_profiles WHERE user_id = $1 AND class_id IS NOT NULL',
      [userId]
    );
    if (!classResult.rows.length) {
      return res.json([]); // No class assigned
    }
    const classId = classResult.rows[0].class_id;
    // Get all courses for this class
    const coursesResult = await pool.query(
      `SELECT c.course_id, c.course_name
       FROM class_courses cc
       JOIN courses c ON cc.course_id = c.course_id
       WHERE cc.class_id = $1`,
      [classId]
    );
    return res.json(coursesResult.rows);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUpcomingAssignments = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Get all assignments for the student that are not completed and due in the future
    const result = await pool.query(
      `SELECT a.assignment_id as id, a.title, a.description, a.due_date, c.course_name, sas.status
       FROM student_assignment_status sas
       JOIN assignments a ON sas.assignment_id = a.assignment_id
       JOIN class_courses cc ON a.class_course_id = cc.id
       JOIN courses c ON cc.course_id = c.course_id
       WHERE sas.student_id = $1
         AND sas.status != 'Completed'
         AND a.due_date > NOW()
       ORDER BY a.due_date ASC`,
      [userId]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming assignments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Get attendance records for the student, grouped by date
    const result = await pool.query(
      `SELECT attendance_date, attendance_status
       FROM attendance
       WHERE user_id = $1 AND role = 'student'
       ORDER BY attendance_date ASC`,
      [userId]
    );
    // Format as { date: status, ... }
    const history = {};
    result.rows.forEach(row => {
      history[row.attendance_date.toISOString().split('T')[0]] = row.attendance_status;
    });
    return res.json(history);
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};