# Config Directory (`server/config/`)

This directory contains configuration files for the EduAi platform's server-side application. These configurations manage environment variables, application settings, and various service integrations.

## Configuration Types

- **Environment**: Environment-specific configurations
- **Database**: Database connection settings
- **Authentication**: JWT and authentication settings
- **API**: External API configurations
- **Logging**: Logging and monitoring settings
- **Security**: Security-related configurations

## File Structure

- `env.js`: Environment variable configurations
- `database.js`: Database connection settings
- `auth.js`: Authentication configurations
- `api.js`: API integration settings
- `logging.js`: Logging configurations
- `security.js`: Security settings

## Best Practices

1. **Environment Variables**
   - Use proper type definitions
   - Include default values
   - Document all variables
   - Validate required variables

2. **Configuration Management**
   - Keep configurations centralized
   - Use TypeScript for type safety
   - Implement proper validation
   - Handle different environments

3. **Security**
   - Never expose sensitive data
   - Use environment variables for secrets
   - Implement proper access control
   - Regular security audits

4. **Maintenance**
   - Keep configurations up to date
   - Document changes
   - Version control configurations
   - Regular reviews

## Usage Example

```javascript
import { config } from '../config';
import { dbConfig } from '../config/database';
import { authConfig } from '../config/auth';

// Using configurations
const connectDB = async () => {
  try {
    const connection = await dbConfig.connect({
      host: config.DB_HOST,
      port: config.DB_PORT,
      database: config.DB_NAME,
      user: config.DB_USER,
      password: config.DB_PASSWORD
    });
    return connection;
  } catch (error) {
    throw new Error('Database connection failed');
  }
};

// Authentication configuration
const jwtConfig = {
  secret: authConfig.JWT_SECRET,
  expiresIn: authConfig.JWT_EXPIRES_IN
};
```

## Contributing

When adding new configurations:
1. Follow the established configuration structure
2. Use proper TypeScript types
3. Include necessary documentation
4. Add appropriate validation
5. Consider environment-specific needs
6. Follow security best practices 