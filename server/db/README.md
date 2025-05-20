# Database Directory (`server/db/`)

This directory contains database configuration, connection management, and migration files for the EduAi platform. It handles all database-related operations and ensures proper database connectivity.

## Directory Structure

- `config/`: Database configuration files
- `migrations/`: Database migration files
- `seeds/`: Database seed files
- `models/`: Database model definitions
- `index.js`: Database connection setup

## Database Configuration

### Connection Setup
- PostgreSQL database connection
- Connection pooling
- Environment-based configuration
- Error handling

### Migration Management
- Version control for database schema
- Up and down migrations
- Seed data management
- Migration history tracking

## Best Practices

1. **Connection Management**
   - Implement connection pooling
   - Handle connection errors
   - Implement retry mechanisms
   - Monitor connection health

2. **Migration Management**
   - Version control migrations
   - Test migrations before deployment
   - Backup data before migrations
   - Document migration changes

3. **Security**
   - Secure database credentials
   - Implement proper access control
   - Use environment variables
   - Regular security audits

4. **Performance**
   - Optimize database queries
   - Implement proper indexing
   - Monitor query performance
   - Handle connection limits

## Usage Example

```javascript
import { db } from '../db';
import { runMigrations } from '../db/migrations';

// Database connection
const connectDB = async () => {
  try {
    await db.authenticate();
    console.log('Database connection established');
    
    // Run migrations
    await runMigrations();
    console.log('Migrations completed');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Using database connection
const query = async () => {
  try {
    const result = await db.query('SELECT * FROM users');
    return result;
  } catch (error) {
    throw new Error('Query failed');
  }
};
```

## Contributing

When working with the database:
1. Follow the established database structure
2. Implement proper error handling
3. Add necessary documentation
4. Include appropriate tests
5. Consider performance implications
6. Follow security best practices 