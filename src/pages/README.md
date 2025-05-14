# Pages Directory (`src/pages/`)

This directory contains the main page components for the EduAi application. Each page represents a distinct route in the application and is organized by user roles and features.

## Directory Structure

- `admin/`: Pages specific to administrator functionality
- `teacher/`: Pages for teacher-specific features
- `student/`: Pages for student-specific features
- `auth/`: Authentication-related pages (login, register, etc.)
- `common/`: Shared pages accessible to all user types

## Page Organization

Each page should:
1. Be contained in its own directory
2. Include related components and utilities
3. Handle its own state management
4. Implement proper routing logic
5. Include necessary API calls

## Best Practices

1. **Page Structure**
   - Keep pages focused and single-responsibility
   - Use layouts for consistent page structure
   - Implement proper loading and error states

2. **State Management**
   - Use React Context for global state
   - Implement local state when appropriate
   - Handle data fetching and caching

3. **Routing**
   - Use React Router for navigation
   - Implement proper route guards
   - Handle 404 and error pages

4. **Performance**
   - Implement code splitting
   - Optimize bundle size
   - Use lazy loading where appropriate

## Example Structure

```
pages/
├── admin/
│   ├── Dashboard/
│   ├── UserManagement/
│   └── Settings/
├── teacher/
│   ├── ClassManagement/
│   ├── AssignmentCreation/
│   └── StudentProgress/
├── student/
│   ├── Dashboard/
│   ├── Assignments/
│   └── StudyMaterials/
└── auth/
    ├── Login/
    └── Register/
```

## Contributing

When adding new pages:
1. Follow the established directory structure
2. Implement proper routing
3. Include necessary documentation
4. Add appropriate tests
5. Ensure responsive design 