# Routes Directory (`server/routes/`)

This directory contains the route definitions for the EduAi platform's API endpoints. Routes define the URL patterns and HTTP methods for accessing different features of the application.

## Route Categories

- **Auth Routes**: Authentication and user management endpoints
- **Admin Routes**: Administrative functionality endpoints
- **Teacher Routes**: Teacher-specific feature endpoints
- **Student Routes**: Student-specific feature endpoints
- **AI Routes**: AI-powered feature endpoints
- **Assignment Routes**: Assignment management endpoints

## Route Structure

Each route file typically includes:
- Route definitions
- Middleware assignments
- Controller mappings
- Request validation
- Access control rules

## Best Practices

1. **Route Organization**
   - Group related routes
   - Use proper HTTP methods
   - Implement versioning
   - Follow RESTful conventions

2. **Middleware**
   - Apply authentication middleware
   - Implement request validation
   - Handle CORS
   - Apply rate limiting

3. **Security**
   - Implement proper access control
   - Use HTTPS
   - Apply security headers
   - Handle sensitive data

4. **Documentation**
   - Document route parameters
   - Include response formats
   - Specify authentication requirements
   - Document rate limits

## Usage Example

```javascript
import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { AuthController } from '../controllers/AuthController';

const router = express.Router();

// Public routes
router.post('/register', 
  validateRequest('register'),
  AuthController.register
);

router.post('/login',
  validateRequest('login'),
  AuthController.login
);

// Protected routes
router.get('/profile',
  authMiddleware,
  AuthController.getProfile
);

export default router;
```

## Contributing

When adding new routes:
1. Follow the established route structure
2. Implement proper middleware
3. Add request validation
4. Include necessary documentation
5. Add appropriate tests
6. Follow security best practices 