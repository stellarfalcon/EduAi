import pool from '../db/config.js';

const Event = {
  create: async (event) => {
    const { title, description, date, time, location, organizer_id } = event;
    const result = await pool.query(
      'INSERT INTO events (title, description, event_date) VALUES ($1, $2, $3) RETURNING *',
      [title, description, date]
    );
    return result.rows[0];
  },

  findAll: async () => {
    const result = await pool.query(
      'SELECT * FROM events ORDER BY event_date DESC',
      []
    );
    return result.rows;
  },

  findUpcoming: async (limit = 5) => {
    const result = await pool.query(
      `SELECT * 
       FROM events 
       WHERE event_date >= CURRENT_DATE 
       ORDER BY event_date 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
};

export default Event;