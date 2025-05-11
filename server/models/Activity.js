import pool from '../db/config.js';

class Activity {
  static async log(userId, role, activityName) {
    try {
      const result = await pool.query(
        'INSERT INTO activities (user_id, role, activity_name) VALUES ($1, $2, $3) RETURNING *',
        [userId, role, activityName]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  static async findByUser(userId) {
    const result = await pool.query(
      'SELECT * FROM activities WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async findByRole(role) {
    const result = await pool.query(
      'SELECT * FROM activities WHERE role = $1 ORDER BY created_at DESC',
      [role]
    );
    return result.rows;
  }

  static async getRecentActivities({ role, classId, userId } = {}) {
    try {
      let query = `SELECT 
        a.activity_name,
        a.role,
        a.activity_timestamp,
        COALESCE(up.full_name, u.email) as user_name
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.user_id
      LEFT JOIN user_profiles up ON u.user_id = up.user_id`;
      let whereClauses = ['DATE(a.activity_timestamp) = CURRENT_DATE'];
      let params = [];
      let idx = 1;

      if (role && role !== 'all') {
        whereClauses.push(`a.role = $${idx++}`);
        params.push(role);
      }
      if (userId) {
        whereClauses.push(`a.user_id = $${idx++}`);
        params.push(userId);
      }
      if (classId) {
        whereClauses.push(`up.class_id = $${idx++}`);
        params.push(classId);
      }

      if (whereClauses.length) {
        query += ' WHERE ' + whereClauses.join(' AND ');
      }
      query += ' ORDER BY a.activity_timestamp DESC';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error in getRecentActivities:', error);
      throw new Error('Failed to fetch recent activities: ' + error.message);
    }
  }

  static async getToolUsageStats() {
    const result = await pool.query(
      `SELECT 
        activity_name,
        COUNT(*) as usage_count
      FROM activities 
      WHERE activity_name LIKE 'use_%'
      GROUP BY activity_name
      ORDER BY usage_count DESC
      LIMIT 20`
    );
    return result.rows;
  }

  static async getDailyActivityCounts(days = 7) {
    const result = await pool.query(
      `SELECT 
        DATE(activity_timestamp) as date,
        COUNT(*) as count
      FROM activities
      WHERE activity_timestamp >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(activity_timestamp)
      ORDER BY date ASC`
    );
    
    // Fill in missing dates with zero counts
    const activityCounts = new Map(
      result.rows.map(row => [row.date.toISOString().split('T')[0], parseInt(row.count)])
    );
    
    const allDates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      allDates.push({
        date: dateStr,
        count: activityCounts.get(dateStr) || 0
      });
    }
    
    return allDates;
  }

  static async getDailyRegistrationCounts(days = 7) {
    // Returns [{ date, teachers, students }]
    const result = await pool.query(
      `SELECT
        d::date as date,
        COALESCE(SUM(CASE WHEN u.role = 'teacher' THEN 1 ELSE 0 END), 0) as teachers,
        COALESCE(SUM(CASE WHEN u.role = 'student' THEN 1 ELSE 0 END), 0) as students
      FROM (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${days - 1} days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date as d
      ) dates
      LEFT JOIN users u ON DATE(u.created_at) = d
      GROUP BY d
      ORDER BY d ASC`
    );
    return result.rows.map(row => ({
      date: row.date.toISOString().split('T')[0],
      teachers: parseInt(row.teachers),
      students: parseInt(row.students)
    }));
  }
}

export default Activity;