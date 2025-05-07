import pool from '../db/config.js';

class Assignment {
  static async findByTeacher(teacherId) {
    const result = await pool.query(
      'SELECT * FROM assignments WHERE teacher_id = $1 ORDER BY created_at DESC',
      [teacherId]
    );
    return result.rows;
  }

  static async findByStudent(studentId) {
    const result = await pool.query(
      'SELECT a.*, u.email as teacher_name, c.name as course_name FROM assignments a ' +
      'JOIN Users u ON a.teacher_id = u.user_id ' +
      'JOIN Courses c ON a.course_id = c.course_id ' +
      'WHERE a.class_id IN (SELECT class_id FROM student_classes WHERE student_id = $1) ' +
      'ORDER BY a.due_date ASC',
      [studentId]
    );
    return result.rows;
  }

  static async create(assignment) {
    const { title, description, dueDate, classId, courseId, teacherId } = assignment;
    const result = await pool.query(
      'INSERT INTO assignments (title, description, due_date, class_id, course_id, teacher_id) ' +
      'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, dueDate, classId, courseId, teacherId]
    );
    return result.rows[0];
  }

  static async updateStatus(assignmentId, studentId, status) {
    const result = await pool.query(
      'INSERT INTO assignment_status (assignment_id, student_id, status) ' +
      'VALUES ($1, $2, $3) ' +
      'ON CONFLICT (assignment_id, student_id) ' +
      'DO UPDATE SET status = $3, updated_at = CURRENT_TIMESTAMP ' +
      'RETURNING *',
      [assignmentId, studentId, status]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM assignments WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
}

export default Assignment;