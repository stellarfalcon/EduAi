import pool from '../db/config.js';

class Class {
  static async findByStudent(studentId) {
    const result = await pool.query(
      `SELECT 
        c.class_id,
        c.class_name,
        c.description,
        c.schedule,
        u.full_name as teacher_name,
        (SELECT COUNT(*) FROM student_classes sc2 WHERE sc2.class_id = c.class_id) as total_students
      FROM classes c
      JOIN student_classes sc ON c.class_id = sc.class_id
      JOIN users u ON c.teacher_id = u.user_id
      WHERE sc.student_id = $1
      ORDER BY c.class_name ASC`,
      [studentId]
    );
    return result.rows;
  }

  static async findById(classId) {
    const result = await pool.query(
      `SELECT 
        c.*,
        u.full_name as teacher_name,
        (SELECT COUNT(*) FROM student_classes sc WHERE sc.class_id = c.class_id) as total_students
      FROM classes c
      JOIN users u ON c.teacher_id = u.user_id
      WHERE c.class_id = $1`,
      [classId]
    );
    return result.rows[0];
  }

  static async isStudentEnrolled(classId, studentId) {
    const result = await pool.query(
      'SELECT 1 FROM student_classes WHERE class_id = $1 AND student_id = $2',
      [classId, studentId]
    );
    return result.rows.length > 0;
  }
}

export default Class; 