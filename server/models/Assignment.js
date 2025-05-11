import pool from '../db/config.js';

class Assignment {
  static async findByTeacher(teacherId) {
    console.log('Finding assignments for teacher:', teacherId);
    const result = await pool.query(
      `SELECT 
        a.assignment_id AS id, 
        a.title, 
        a.description, 
        TO_CHAR(a.due_date, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "dueDate",
        cc.class_id, 
        c.class_name AS "className", 
        cc.course_id, 
        co.course_name AS "courseName",
        a.created_at, 
        0 as "totalStudents", 
        0 as "submittedCount"
       FROM assignments a
       JOIN class_courses cc ON a.class_course_id = cc.id
       JOIN classes c ON cc.class_id = c.class_id
       JOIN courses co ON cc.course_id = co.course_id
       WHERE a.created_by_teacher_id = $1
       ORDER BY a.created_at DESC`,
      [teacherId]
    );
    console.log('Raw assignment data from DB:', JSON.stringify(result.rows, null, 2));
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
    // Find the class_course_id for this class and course
    const ccResult = await pool.query(
      'SELECT id FROM class_courses WHERE class_id = $1 AND course_id = $2 AND teacher_id = $3',
      [classId, courseId, teacherId]
    );
    if (ccResult.rows.length === 0) {
      throw new Error('No class_course assignment found for this teacher, class, and course');
    }
    const classCourseId = ccResult.rows[0].id;
    const result = await pool.query(
      'INSERT INTO assignments (title, description, due_date, class_course_id, created_by_teacher_id) ' +
      'VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, dueDate, classCourseId, teacherId]
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

  static async findByClassAndStudent(classId, studentId) {
    const result = await pool.query(
      `SELECT 
        a.*,
        CASE 
          WHEN a.due_date < CURRENT_DATE AND a.status != 'Completed' THEN 'Overdue'
          ELSE a.status
        END as status
      FROM assignments a
      WHERE a.class_id = $1
      AND a.class_id IN (SELECT class_id FROM student_classes WHERE student_id = $2)
      ORDER BY a.due_date ASC`,
      [classId, studentId]
    );
    return result.rows;
  }
}

export default Assignment;