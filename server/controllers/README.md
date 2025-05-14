# Controllers Directory (`server/controllers/`)

This directory contains the route controllers for the EduAi platform's API endpoints. Controllers handle the business logic for processing requests and sending responses.

## Controller Types

- **AuthController**: Authentication and user management
- **AdminController**: Administrative functions
- **TeacherController**: Teacher-specific operations
- **StudentController**: Student-specific operations
- **AIController**: AI-powered features
- **AssignmentController**: Assignment management

## Controller Structure

Each controller typically includes:
- Request validation
- Business logic processing
- Database operations
- Response formatting
- Error handling

## Best Practices

1. **Request Handling**
   - Validate input data
   - Sanitize user input
   - Handle file uploads properly
   - Implement rate limiting

2. **Response Formatting**
   - Use consistent response structure
   - Include proper status codes
   - Format error messages
   - Handle different content types

3. **Error Handling**
   - Implement try-catch blocks
   - Use custom error classes
   - Log errors appropriately
   - Send meaningful error messages

4. **Security**
   - Implement authentication checks
   - Verify user permissions
   - Sanitize sensitive data
   - Prevent common vulnerabilities

## Usage Example

```javascript
import { AuthController } from '../controllers/AuthController';

// Controller method example
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Process login
    const result = await AuthController.login(email, password);
    
    // Send response
    res.status(200).json(result);
  } catch (error) {
    // Handle error
    res.status(500).json({
      error: 'Login failed'
    });
  }
};
```

## Contributing

When adding new controllers:
1. Follow the established controller structure
2. Implement proper error handling
3. Add input validation
4. Include necessary documentation
5. Add appropriate tests
6. Follow security best practices 