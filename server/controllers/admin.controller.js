import { logActivity } from '../utils/helpers.js';
import User from '../models/User.js';
import RegistrationRequest from '../models/RegistrationRequest.js';
import pool from '../db/config.js';
import Activity from '../models/Activity.js';

export const getRegistrationRequests = async (req, res) => {
  try {
    const requests = await RegistrationRequest.findAll();
    return res.json(requests);
  } catch (error) {
    console.error('Error fetching registration requests:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const approveRegistration = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get the registration request
    const request = await RegistrationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Registration request not found' });
    }
    
    // Create user
    await User.create(request.username, request.password, request.role);
    
    // Update request status
    await RegistrationRequest.updateStatus(id, 'approved', req.user.email);
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'approve_registration');
    
    return res.json({ message: 'Registration request approved' });
  } catch (error) {
    console.error('Error approving registration request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const rejectRegistration = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Update request status
    await RegistrationRequest.updateStatus(id, 'rejected', req.user.email);
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'reject_registration');
    
    return res.json({ message: 'Registration request rejected' });
  } catch (error) {
    console.error('Error rejecting registration request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deactivateUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    await User.updateStatus(id, 2); // 2 for suspended
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'deactivate_user');
    
    return res.json({ message: 'User deactivated' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const reactivateUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log('Attempting to reactivate user:', id);

    const user = await User.findById(id);
    if (!user) {
      console.log('User not found:', id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Found user:', user);
    const updatedUser = await User.updateStatus(id, 1); // 1 for active
    console.log('Update result:', updatedUser);

    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to update user status' });
    }
    
    await logActivity(req.user.userId, req.user.role, 'reactivate_user');
    return res.json({ message: 'User reactivated successfully' });
  } catch (error) {
    console.error('Error reactivating user:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      details: error.message 
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // Get total active students
    const studentsResult = await pool.query(
      'SELECT COUNT(*) as count FROM Users WHERE role = $1 AND user_status = 1',
      ['student']
    );
    
    // Get total active teachers
    const teachersResult = await pool.query(
      'SELECT COUNT(*) as count FROM Users WHERE role = $1 AND user_status = 1',
      ['teacher']
    );

    // Get total active admins
    const adminsResult = await pool.query(
      'SELECT COUNT(*) as count FROM Users WHERE role = $1 AND user_status = 1',
      ['admin']
    );
    
    // Get pending registration requests
    const requestsResult = await pool.query(
      'SELECT COUNT(*) as count FROM registration_requests WHERE status = $1',
      ['pending']
    );

    const stats = {
      totalStudents: parseInt(studentsResult.rows[0].count),
      totalTeachers: parseInt(teachersResult.rows[0].count),
      totalAdmins: parseInt(adminsResult.rows[0].count),
      pendingRequests: parseInt(requestsResult.rows[0].count),
      averageAttendance: 87 // keeping mock data for now as requested
    };
    
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const activities = await Activity.getRecentActivities(5);
    return res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return res.status(500).json({ message: 'Failed to fetch recent activities' });
  }
};

export const getToolUsageStats = async (req, res) => {
  try {
    const stats = await Activity.getToolUsageStats();
    
    // Transform activity names to readable labels
    const transformedStats = stats.map(stat => ({
      label: stat.activity_name.replace('use_', '').split('_').map(
        word => word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      count: parseInt(stat.usage_count)
    }));
    
    return res.json(transformedStats);
  } catch (error) {
    console.error('Error fetching tool usage stats:', error);
    return res.status(500).json({ message: 'Failed to fetch tool usage statistics' });
  }
};

export const getActivityTrends = async (req, res) => {
  try {
    const activityTrends = await Activity.getDailyActivityCounts(7);
    return res.json(activityTrends);
  } catch (error) {
    console.error('Error fetching activity trends:', error);
    return res.status(500).json({ message: 'Failed to fetch activity trends' });
  }
};