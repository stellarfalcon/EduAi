# Config Directory (`src/config/`)

This directory contains configuration files and constants used throughout the EduAi application. These configurations help maintain consistency and make the application more maintainable.

## Configuration Types

- **Environment Variables**: Environment-specific configurations
- **API Configurations**: API endpoints and settings
- **Feature Flags**: Feature toggles and switches
- **Constants**: Application-wide constants
- **Theme Configurations**: Styling and theming settings

## File Structure

- `env.ts`: Environment variable configurations
- `api.config.ts`: API-related configurations
- `constants.ts`: Application constants
- `theme.config.ts`: Theme-related configurations
- `routes.config.ts`: Route definitions and configurations

## Best Practices

1. **Environment Variables**
   - Use proper type definitions
   - Include default values
   - Document all variables

2. **Configuration Management**
   - Keep configurations centralized
   - Use TypeScript for type safety
   - Implement proper validation

3. **Security**
   - Never expose sensitive data
   - Use environment variables for secrets
   - Implement proper access control

4. **Maintenance**
   - Keep configurations up to date
   - Document changes
   - Version control configurations

## Usage Example

```typescript
import { API_CONFIG } from '@/config/api.config';
import { ROUTES } from '@/config/routes.config';

// Using configurations
const apiUrl = API_CONFIG.baseUrl;
const loginRoute = ROUTES.auth.login;
```

## Contributing

When adding new configurations:
1. Follow the established structure
2. Use proper TypeScript types
3. Include necessary documentation
4. Add appropriate validation
5. Consider environment-specific needs
6. Follow security best practices 