import { validationResult, body } from 'express-validator';

// Middleware to check validation results
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Registration validation rules
export const registerValidationRules = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
  body('role')
    .isIn(['student', 'teacher'])
    .withMessage('Role must be either student or teacher')
];

// Login validation rules
export const loginValidationRules = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

// Assignment validation rules
export const assignmentValidationRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('classId')
    .isInt()
    .withMessage('Class ID must be a valid integer'),
  body('courseId')
    .isInt()
    .withMessage('Course ID must be a valid integer')
];

// Assignment status validation rules
export const assignmentStatusValidationRules = [
  body('status')
    .isIn(['Not Started', 'In Progress', 'Completed'])
    .withMessage('Status must be Not Started, In Progress, or Completed')
];

// AI prompt validation rules
export const aiPromptValidationRules = [
  body('prompt')
    .trim()
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ max: 1000 })
    .withMessage('Prompt must be less than 1000 characters')
];

// Admin validation rules
export const userStatusValidationRules = [
  body('status')
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

export const registrationRequestValidationRules = [
  body('id')
    .isInt()
    .withMessage('Registration request ID must be a valid integer'),
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be either approve or reject')
];