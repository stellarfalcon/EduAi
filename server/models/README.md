# Models Directory (`server/models/`)

This directory contains the database models for the EduAi platform. These models define the structure and relationships of the data stored in the PostgreSQL database.

## Model Types

- **User**: User account information and authentication details
- **Assignment**: Educational assignments and their metadata
- **Class**: Class/course information
- **Submission**: Student assignment submissions
- **RegistrationRequest**: User registration requests
- **Notification**: System notifications

## Model Structure

Each model typically includes:
- Table schema definition
- Relationships with other models
- Validation rules
- Helper methods
- Type definitions

## Best Practices

1. **Schema Design**
   - Use appropriate data types
   - Define proper constraints
   - Implement foreign key relationships
   - Include timestamps for auditing

2. **Validation**
   - Implement input validation
   - Define required fields
   - Set field constraints
   - Handle data sanitization

3. **Relationships**
   - Define clear relationships
   - Use proper foreign keys
   - Implement cascading rules
   - Document relationship types

4. **Performance**
   - Add appropriate indexes
   - Optimize queries
   - Handle large datasets
   - Implement caching when needed

## Usage Example

```javascript
import { User } from '../models/User';
import { Assignment } from '../models/Assignment';

// Creating a new user
const newUser = await User.create({
  email: 'user@example.com',
  password: hashedPassword,
  role: 'student'
});

// Finding assignments for a user
const assignments = await Assignment.findAll({
  where: { userId: newUser.id }
});
```

## Contributing

When adding new models:
1. Follow the established model structure
2. Implement proper validation
3. Define clear relationships
4. Add necessary indexes
5. Include documentation
6. Add appropriate tests 