import jwt from 'jsonwebtoken';
import Activity from '../models/Activity.js';

export const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.user_id, 
      email: user.email, 
      role: user.role 
    }, 
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

export const logActivity = async (userId, role, activityName) => {
  try {
    await Activity.log(userId, role, activityName);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};