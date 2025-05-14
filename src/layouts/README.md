# Layouts Directory (`src/layouts/`)

This directory contains layout components that define the structural framework for different sections of the EduAi application. Layouts provide consistent UI patterns and navigation structures for different user roles.

## Layout Types

- **AdminLayout**: Layout for administrator pages
- **TeacherLayout**: Layout for teacher-specific pages
- **StudentLayout**: Layout for student-specific pages
- **AuthLayout**: Layout for authentication pages
- **MainLayout**: Common layout shared across the application

## Layout Components

Each layout typically includes:
- Navigation menu
- Header with user information
- Sidebar (if applicable)
- Footer
- Content area
- Responsive design elements

## Best Practices

1. **Structure**
   - Keep layouts modular and reusable
   - Implement responsive design
   - Handle different screen sizes appropriately

2. **Navigation**
   - Implement role-based navigation
   - Include breadcrumbs for better UX
   - Handle active states for current route

3. **State Management**
   - Handle layout-specific state
   - Manage user session information
   - Control sidebar/menu visibility

4. **Styling**
   - Use consistent spacing and theming
   - Implement proper z-index management
   - Follow accessibility guidelines

## Usage Example

```tsx
import { AdminLayout } from '@/layouts/AdminLayout';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="content">
        {/* Page content goes here */}
      </div>
    </AdminLayout>
  );
};
```

## Contributing

When creating or modifying layouts:
1. Maintain consistency with existing layouts
2. Ensure proper responsive behavior
3. Include necessary documentation
4. Test across different screen sizes
5. Verify accessibility compliance 