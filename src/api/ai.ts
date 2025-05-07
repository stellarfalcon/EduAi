import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/constants';
import { guardrailConfig } from '../config/guardrails';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { debugLog } from '../utils/helpers';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const createGuardrailPrompt = (userPrompt: string) => {
  return {
    evaluation: `You are an educational AI assistant. As a first step, evaluate if this question complies with educational guidelines.
Only respond with one of these two formats:
1. If compliant, respond with exactly: COMPLIANT
2. If not compliant, respond with exactly: NOT_COMPLIANT: [reason]

Question: "${userPrompt}"

Guidelines:
${JSON.stringify(guardrailConfig, null, 2)}

Response:`,
    
    answer: `You are an educational AI assistant helping students learn. Provide a clear, thorough, and educational answer to this question:

${userPrompt}`
  };
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateAIResponse = async (prompt: string, retryCount = 0): Promise<string> => {
  try {
    debugLog(`Generating AI response for prompt: ${prompt}`, 'info');
    const response = await axios.post(`${API_URL}/ai/validate`, { prompt }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    debugLog(`AI Response received: ${JSON.stringify(response.data)}`, 'info');
    return response.data.response;
  } catch (error: any) {
    if (error.response?.status === 400) {
      const reason = error.response.data.reason || 'Content not allowed';
      debugLog(`Content validation failed: ${reason}`, 'warn');
      throw new Error(`Content not allowed: ${reason}`);
    } else if (error.response?.status === 429 || (error.message && error.message.includes('rate limit'))) {
      if (retryCount < MAX_RETRIES) {
        debugLog(`Rate limited, retrying (${retryCount + 1}/${MAX_RETRIES})...`, 'warn');
        await sleep(RETRY_DELAY * (retryCount + 1));
        return generateAIResponse(prompt, retryCount + 1);
      }
      debugLog('Rate limit retries exhausted', 'error');
      throw new Error('The AI service is currently experiencing high demand. Please try again in a moment.');
    } else {
      debugLog(`AI Service error: ${error.message}`, 'error');
      throw error;
    }
  }
};

export const generateLessonPlan = async (params: {
  subject: string;
  gradeLevel: string;
  topic: string;
  duration: string;
  standards?: string;
  additionalNotes?: string;
}) => {
  try {
    debugLog(`Generating lesson plan for: ${params.topic}`, 'info');
    const response = await axios.post(`${API_URL}/ai/lesson-plan`, params, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    debugLog(`Lesson plan generated successfully`, 'info');
    return response.data;
  } catch (error: any) {
    debugLog(`Lesson plan generation failed: ${error.message}`, 'error');
    debugLog('Raw error:', 'error');
    debugLog(error.response?.data || error, 'error');
    throw error;
  }
};