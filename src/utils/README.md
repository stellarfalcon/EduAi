# Utils Directory (`src/utils/`)

This directory contains utility functions and helper methods used throughout the EduAi application. These utilities provide common functionality that can be reused across different components and features.

## Utility Categories

- **Formatting**: Date, number, and string formatting utilities
- **Validation**: Input validation and data checking functions
- **Storage**: Local storage and session storage helpers
- **Helpers**: General helper functions
- **Constants**: Reusable constants and enums

## File Structure

- `date.utils.ts`: Date manipulation and formatting
- `validation.utils.ts`: Input validation functions
- `storage.utils.ts`: Storage-related utilities
- `format.utils.ts`: String and number formatting
- `helpers.ts`: General helper functions

## Best Practices

1. **Function Design**
   - Keep functions pure when possible
   - Implement proper error handling
   - Use TypeScript for type safety
   - Document function parameters and return types

2. **Testing**
   - Write unit tests for utilities
   - Include edge cases
   - Maintain test coverage

3. **Performance**
   - Optimize for performance
   - Use proper memoization when needed
   - Avoid unnecessary computations

4. **Maintenance**
   - Keep utilities focused and single-purpose
   - Document usage examples
   - Version control changes

## Usage Example

```typescript
import { formatDate } from '@/utils/date.utils';
import { validateEmail } from '@/utils/validation.utils';

// Using utilities
const formattedDate = formatDate(new Date(), 'YYYY-MM-DD');
const isValidEmail = validateEmail('user@example.com');
```

## Contributing

When adding new utilities:
1. Follow the established structure
2. Implement proper TypeScript types
3. Include necessary documentation
4. Add appropriate tests
5. Consider performance implications
6. Follow naming conventions 