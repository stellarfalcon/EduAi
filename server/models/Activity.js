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

  static async getRecentActivities() {
    try {
      const result = await pool.query(
        `SELECT 
          a.activity_name,
          a.role,
          a.activity_timestamp,
          COALESCE(up.full_name, u.email) as user_name
        FROM activities a
        LEFT JOIN users u ON a.user_id = u.user_id
        LEFT JOIN user_profiles up ON u.user_id = up.user_id
        WHERE DATE(a.activity_timestamp) = CURRENT_DATE
        ORDER BY a.activity_timestamp DESC`
      );
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
}

export default Activity;