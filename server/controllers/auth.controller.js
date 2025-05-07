import bcrypt from 'bcryptjs';
import { generateToken, logActivity } from '../utils/helpers.js';
import User from '../models/User.js';
import RegistrationRequest from '../models/RegistrationRequest.js';

export const register = async (req, res) => {
  const { email, password, role } = req.body;
  
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (!['student', 'teacher'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Check if registration request already exists
    const existingRequest = await RegistrationRequest.findByUsername(email);
    if (existingRequest) {
      return res.status(400).json({ message: 'Registration request already submitted' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create registration request
    await RegistrationRequest.create(email, hashedPassword, role);
    
    return res.status(201).json({ message: 'Registration request submitted successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid Email' });
    }
    
   // Check if user is active
  if (user.user_status !== 1) {
    if (user.user_status === 0) {
      return res.status(403).json({ message: 'User Deleted' });
    } else if (user.user_status === 2) {
      return res.status(403).json({ message: 'User Suspended' });
    }
    return res.status(403).json({ message: 'Non Active User' });
  }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Password' });
    }
    
    // Log login activity
    await logActivity(user.user_id, user.role, 'login');
    
    // Generate token
    const token = generateToken(user);
    
    return res.json({ 
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const verifyToken = (req, res) => {
  return res.json({ user: req.user });
};