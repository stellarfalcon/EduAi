import pool from '../db/config.js';

class User {
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM Users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async create(email, hashedPassword, role) {
    const result = await pool.query(
      'INSERT INTO Users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, role]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM Users WHERE user_id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE Users SET user_status = $1, "updated_at" = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query(
      `SELECT 
        user_id,
        email,
        role,
        user_status,
        user_status in (0,2) as is_deleted_user,
        created_at as "createdAt"
      FROM users 
      ORDER BY created_at DESC`
    );
    return result.rows;
  }
}

export default User;