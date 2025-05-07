import { validateContent, generateLessonPlan } from '../services/ai.service.js';
import { logActivity } from '../utils/helpers.js';

export const handleAIValidation = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        message: 'Content does not comply with educational guidelines',
        reason: 'No prompt provided' 
      });
    }

    const result = await validateContent(prompt);
    
    if (!result.isValid) {
      return res.status(400).json({ 
        message: 'Content does not comply with educational guidelines',
        reason: result.reason 
      });
    }

    // Log activity
    await logActivity(req.user.userId, req.user.role, 'use_ai_tool');
    
    return res.json({ response: result.response });
  } catch (error) {
    console.error('Error processing AI request:', error);
    return res.status(500).json({ 
      message: 'Error processing request',
      reason: error.message || 'An internal error occurred while processing your request'
    });
  }
};

export const handleLessonPlanGeneration = async (req, res) => {
  try {
    const lessonPlan = await generateLessonPlan(req.body);
    return res.json(lessonPlan);
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to generate lesson plan' 
    });
  }
};