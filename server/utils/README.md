# Utils Directory (`server/utils/`)

This directory contains utility functions and helper methods used throughout the EduAi platform's server-side code. These utilities provide common functionality that can be reused across different parts of the application.

## Utility Categories

- **Authentication**: JWT token handling and password hashing
- **Validation**: Data validation and sanitization
- **Formatting**: Data formatting and transformation
- **Logging**: Logging utilities
- **Error Handling**: Error formatting and handling
- **File Operations**: File handling utilities

## File Structure

- `auth.utils.js`: Authentication-related utilities
- `validation.utils.js`: Data validation functions
- `format.utils.js`: Data formatting utilities
- `logger.utils.js`: Logging utilities
- `error.utils.js`: Error handling utilities
- `file.utils.js`: File operation utilities

## Best Practices

1. **Function Design**
   - Keep functions pure when possible
   - Implement proper error handling
   - Use TypeScript for type safety
   - Document function parameters and return types

2. **Security**
   - Handle sensitive data properly
   - Implement proper encryption
   - Follow security best practices
   - Validate input data

3. **Performance**
   - Optimize for performance
   - Use proper caching
   - Handle large datasets
   - Implement proper error handling

4. **Maintenance**
   - Keep utilities focused and single-purpose
   - Document usage examples
   - Version control changes
   - Include appropriate tests

## Usage Example

```javascript
import { hashPassword } from '../utils/auth.utils';
import { validateEmail } from '../utils/validation.utils';
import { formatError } from '../utils/error.utils';

// Using utilities
const createUser = async (userData) => {
  try {
    // Validate email
    if (!validateEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user with hashed password
    const user = await User.create({
      ...userData,
      password: hashedPassword
    });

    return user;
  } catch (error) {
    throw formatError(error);
  }
};
```

## Contributing

When adding new utilities:
1. Follow the established utility structure
2. Implement proper error handling
3. Add necessary documentation
4. Include appropriate tests
5. Consider performance implications
6. Follow security best practices 