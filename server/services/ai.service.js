import { GoogleGenerativeAI } from '@google/generative-ai';
import guardrailConfig from '../config/guardrails.js';
import EnvironmentService from './env.service.js';

export const validateContent = async (prompt) => {
  const env = EnvironmentService.getEnvWithDefaults();
  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: 'tunedModels/sparkdfanalyser-gu3i6lr7rlxr' });

  // Check for basic greetings first
  const lowerPrompt = prompt.toLowerCase().trim();
  const isBasicGreeting = guardrailConfig.contentGuidelines.conversationalElements.allowedGreetings
    .some(greeting => lowerPrompt.startsWith(greeting.toLowerCase()));

  if (isBasicGreeting) {
    const greetingPrompt = `You are a friendly educational AI assistant. Generate a warm and welcoming response to this greeting: "${prompt}"`;
    const result = await model.generateContent(greetingPrompt);
    return {
      isValid: true,
      response: await result.response.text(),
      isGreeting: true
    };
  }

  // For non-greetings, proceed with educational content validation
  const evaluationPrompt = `You are an educational AI assistant. Evaluate if this input complies with educational guidelines.
Consider that basic greetings and conversation starters are allowed.
Only respond with one of these two formats:
1. If compliant, respond with exactly: COMPLIANT
2. If not compliant, respond with exactly: NOT_COMPLIANT: [reason]

Input: "${prompt}"

Guidelines:
${JSON.stringify(guardrailConfig, null, 2)}

Response:`;

  const evaluationResult = await model.generateContent(evaluationPrompt);
  const evaluationText = await evaluationResult.response.text();

  if (evaluationText.startsWith('NOT_COMPLIANT:')) {
    const reason = evaluationText.substring('NOT_COMPLIANT:'.length).trim();
    return {
      isValid: false,
      reason,
      isGreeting: false
    };
  }

  // If content is compliant, generate actual response
  const answerPrompt = `You are an educational AI assistant helping students learn. Provide a clear, thorough, and educational answer to this question:

${prompt}`;
  
  const result = await model.generateContent(answerPrompt);
  return {
    isValid: true,
    response: await result.response.text(),
    isGreeting: false
  };
};

export const generateLessonPlan = async (params) => {
  const env = EnvironmentService.getEnvWithDefaults();
  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: 'tunedModels/sparkdfanalyser-gu3i6lr7rlxr' });

  const prompt = `You are an AI teaching assistant. Generate a detailed lesson plan in valid JSON format.

Parameters:
Subject: ${params.subject}
Grade Level: ${params.gradeLevel}
Topic: ${params.topic}
Duration: ${params.duration} minutes
Learning Standards: ${params.standards || 'Not specified'}
Additional Notes: ${params.additionalNotes || 'None'}

IMPORTANT: Your response must be ONLY valid JSON that follows this exact structure:
{
  "title": "string",
  "objectives": ["array of strings"],
  "materials": ["array of strings"],
  "activities": [
    {
      "title": "string",
      "description": "string",
      "duration": "string"
    }
  ],
  "assessment": "string"
}

Do not include any additional text, markdown, or explanations - ONLY the JSON response.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    console.log('Raw Gemini Response:', response);
    
    try {
      const cleanedResponse = response
        .replace(/^\`\`\`json\n|\`\`\`$/g, '') // Remove markdown code block markers
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
      const lessonPlan = JSON.parse(cleanedResponse);
      
      if (!lessonPlan.title || !Array.isArray(lessonPlan.objectives) || 
          !Array.isArray(lessonPlan.materials) || !Array.isArray(lessonPlan.activities) ||
          !lessonPlan.assessment) {
        throw new Error('Missing required fields in lesson plan');
      }

      if (!lessonPlan.activities.every(activity => 
        activity.title && activity.description && activity.duration)) {
        throw new Error('Invalid activities structure');
      }

      lessonPlan.assessment = lessonPlan.assessment.replace(/\n/g, ' ');

      return {
        ...lessonPlan,
        subject: params.subject,
        gradeLevel: params.gradeLevel,
        duration: `${params.duration} minutes`,
        created_at: new Date().toISOString()
      };
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.log('Failed to parse response:', response);
      throw new Error(`Failed to generate valid lesson plan format: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};