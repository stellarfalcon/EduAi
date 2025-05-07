import { logActivity } from '../utils/helpers.js';
import Assignment from '../models/Assignment.js';

export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.findByTeacher(req.user.userId);
    return res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createAssignment = async (req, res) => {
  const { title, description, dueDate, classId, courseId } = req.body;
  
  if (!title || !description || !dueDate || !classId || !courseId) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      classId,
      courseId,
      teacherId: req.user.userId
    });
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'create_assignment');
    
    return res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};