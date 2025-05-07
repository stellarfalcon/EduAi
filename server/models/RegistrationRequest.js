import pool from '../db/config.js';

class RegistrationRequest {
  static async findAll() {
    const result = await pool.query(
      'SELECT * FROM registration_requests ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async create(username, hashedPassword, role) {
    const result = await pool.query(
      'INSERT INTO registration_requests (username, password, role) VALUES ($1, $2, $3) RETURNING *',
      [username, hashedPassword, role]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM registration_requests WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status, reviewedBy) {
    const result = await pool.query(
      'UPDATE registration_requests SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, reviewedBy, id]
    );
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await pool.query(
      'SELECT * FROM registration_requests WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }
}

export default RegistrationRequest;