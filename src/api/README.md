# API Directory (`src/api/`)

This directory contains all API-related code for the EduAi application, including API clients, service functions, and type definitions for backend communication.

## Directory Structure

- `clients/`: API client configurations and instances
- `services/`: Service functions for different API endpoints
- `types/`: TypeScript interfaces and types for API responses
- `utils/`: API-related utility functions
- `constants/`: API-related constants and configurations

## API Organization

### Clients
- Axios instance configuration
- Request/response interceptors
- Error handling
- Authentication token management

### Services
- User management services
- Authentication services
- Content management services
- Analytics services

## Best Practices

1. **Error Handling**
   - Implement consistent error handling
   - Use proper error types
   - Include error logging

2. **Type Safety**
   - Define interfaces for all API responses
   - Use TypeScript for type checking
   - Maintain type documentation

3. **Authentication**
   - Handle token management
   - Implement refresh token logic
   - Secure API calls

4. **Performance**
   - Implement request caching
   - Use proper request cancellation
   - Optimize payload size

## Usage Example

```typescript
import { userService } from '@/api/services/userService';
import { User } from '@/api/types/user';

// Using API service
const fetchUser = async (userId: string): Promise<User> => {
  try {
    const user = await userService.getUser(userId);
    return user;
  } catch (error) {
    // Handle error appropriately
    throw error;
  }
};
```

## Contributing

When adding new API functionality:
1. Follow the established directory structure
2. Implement proper error handling
3. Add TypeScript types
4. Include necessary documentation
5. Add appropriate tests
6. Follow security best practices 