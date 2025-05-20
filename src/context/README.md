# Context Directory (`src/context/`)

This directory contains React Context providers that manage global state and shared functionality across the EduAi application. These contexts help in managing application-wide state and providing data to components at different levels of the component tree.

## Context Types

- **AuthContext**: Manages authentication state and user information
- **ThemeContext**: Handles application theming and appearance
- **NotificationContext**: Manages application notifications
- **UserContext**: Manages user-specific data and preferences
- **SettingsContext**: Handles application settings and configurations

## Context Structure

Each context typically includes:
- Context definition
- Provider component
- Custom hooks for context usage
- Type definitions
- Default values

## Best Practices

1. **State Management**
   - Keep context focused and single-responsibility
   - Implement proper state updates
   - Handle loading and error states

2. **Performance**
   - Use proper memoization
   - Implement context splitting when needed
   - Avoid unnecessary re-renders

3. **Type Safety**
   - Define proper TypeScript interfaces
   - Include proper type checking
   - Document context values

4. **Error Handling**
   - Implement proper error boundaries
   - Handle edge cases
   - Provide fallback values

## Usage Example

```typescript
import { useAuth } from '@/context/AuthContext';

const UserProfile = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginButton onClick={login} />;
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

## Contributing

When creating new contexts:
1. Follow the established context structure
2. Implement proper TypeScript types
3. Include necessary documentation
4. Add appropriate tests
5. Consider performance implications
6. Handle edge cases and errors 