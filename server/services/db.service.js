import pool from '../db/config.js';

class DatabaseService {
  static async initializeTables() {
    try {
      // Create Users table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS Users (
          user_id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
          user_status SMALLINT DEFAULT 1 CHECK (user_status IN (0, 1, 2)), -- 0: Deleted, 1: Active, 2: Suspended
          "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create registration_requests table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS registration_requests (
          id SERIAL,
          username VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(50) default = 'pending',
          reviewed_by TEXT,
          reviewed_at TIMESTAMP WITH TIME ZONE,
          notes text NULL,
          full_name text NULL,
          contact_number text NULL,
          CONSTRAINT registration_requests_pkey PRIMARY KEY (id),
          CONSTRAINT registration_requests_role_check CHECK ((role = ANY (ARRAY['student'::text, 'teacher'::text]))),
          CONSTRAINT registration_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))),
          CONSTRAINT registration_requests_username_key UNIQUE (username)
        );
      `);

      // Create activities table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS activities (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES Users(user_id),
          role VARCHAR(50) NOT NULL,
          activity_name VARCHAR(255) NOT NULL,
          activity_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create courses table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS courses (
          course_id SERIAL PRIMARY KEY,
          course_name TEXT NOT NULL
        );
      `);

      // Create classes table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS classes (
          class_id SERIAL PRIMARY KEY,
          class_name TEXT NOT NULL
        );
      `);

      // Create class_courses table for class enrollment
      await pool.query(`
        CREATE TABLE IF NOT EXISTS class_courses (
          id SERIAL PRIMARY KEY,
          class_id INTEGER REFERENCES classes(class_id),
          course_id INTEGER REFERENCES courses(course_id),
          teacher_id INTEGER REFERENCES users(user_id),
          start_date DATE,
          end_date DATE
        );
      `);

      // Create assignments table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS assignments (
          assignment_id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          class_course_id INTEGER REFERENCES class_courses(id),
          created_by_teacher_id INTEGER REFERENCES users(user_id),
          created_by INTEGER REFERENCES users(user_id),
          due_date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
        );
      `);

      // Create student_assignment_status table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS student_assignment_status (
          id SERIAL PRIMARY KEY,
          assignment_id INTEGER REFERENCES assignments(assignment_id),
          student_id INTEGER REFERENCES users(user_id),
          status VARCHAR(20) NOT NULL CHECK (
            status IN ('Not Attempted', 'Pending', 'In Progress', 'Completed')
          ),
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT assignment_key UNIQUE (assignment_id, student_id)
        );
      `);

      // Create user_requests table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_requests (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(user_id),
          request_type SMALLINT CHECK (request_type IN (1, 2, 3)), -- 1: Leave, 2: Access, 3: Password Reset
          request_details TEXT,
          request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          resolved_by TEXT,
          resolved_at TIMESTAMP,
          notes TEXT
        );  
      `);

      // Create user_profiles table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          user_id INTEGER PRIMARY KEY REFERENCES users(user_id),
          full_name TEXT NOT NULL,
          contact_number TEXT,
          address TEXT,
          joining_date DATE,
          leaving_date DATE,
          enrollment_date DATE,
          class_id INTEGER REFERENCES classes(class_id),
          is_active BOOLEAN
        );  
      `);

      // Create attendance table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS  attendance (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(user_id),
          role VARCHAR(50) CHECK (role IN ('teacher', 'student')),
          class_course_id INTEGER REFERENCES class_courses(id),
          attendance_date DATE NOT NULL,
          attendance_status INTEGER CHECK (attendance_status IN (0, 1, 2)) -- 0 = absent, 1 = Present, 2 = Excused 
        );   
      `);


      // Create events table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS events (
          event_id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          event_date TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );   
      `);

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database tables:', error);
      throw error;
    }
  }

  static async checkConnection() {
    try {
      const result = await pool.query('SELECT NOW()');
      return result.rows[0];
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }
}

export default DatabaseService;
