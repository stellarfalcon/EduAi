import { logActivity } from '../utils/helpers.js';
import Assignment from '../models/Assignment.js';

export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.findByStudent(req.user.userId);
    return res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateAssignmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['Not Started', 'In Progress', 'Completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  try {
    // Verify assignment exists
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Update the status
    await Assignment.updateStatus(id, req.user.userId, status);
    
    // Log activity
    await logActivity(req.user.userId, req.user.role, 'update_assignment_status');
    
    return res.json({ message: 'Assignment status updated' });
  } catch (error) {
    console.error('Error updating assignment status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};