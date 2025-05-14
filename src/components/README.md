# Components Directory (`src/components/`)

This directory contains reusable UI components that are used throughout the EduAi application. These components are designed to be modular, maintainable, and follow a consistent design system.

## Component Categories

- **Common Components**: Basic UI elements like buttons, inputs, cards, etc.
- **Layout Components**: Structural components for page organization
- **Feature Components**: Complex components specific to certain features
- **Form Components**: Reusable form elements and validation components

## Best Practices

1. **Component Structure**
   - Each component should be in its own directory
   - Include component file, styles, tests, and documentation
   - Use TypeScript for type safety

2. **Naming Conventions**
   - Use PascalCase for component names
   - Use descriptive, purpose-indicating names
   - Suffix with appropriate type (e.g., Button, Card, Modal)

3. **Props Interface**
   - Define clear prop interfaces
   - Document required and optional props
   - Include prop types and default values

4. **Styling**
   - Use Tailwind CSS for styling
   - Follow the design system guidelines
   - Maintain consistent spacing and theming

## Usage Example

```tsx
import { Button } from '@/components/common/Button';

// Component usage
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

## Contributing

When adding new components:
1. Follow the established component structure
2. Include proper documentation
3. Add necessary tests
4. Ensure accessibility compliance
5. Update this README if adding new component categories 