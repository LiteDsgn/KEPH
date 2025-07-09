# Testing Guide

This document outlines the testing infrastructure and practices for the KEPH task management application.

## Testing Stack

- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements
- **@testing-library/user-event**: User interaction simulation

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized alongside the source code:

```
src/
├── components/
│   └── keph/
│       ├── __tests__/
│       │   ├── task-item.test.tsx
│       │   └── task-list.test.tsx
│       ├── task-item.tsx
│       └── task-list.tsx
├── hooks/
│   ├── __tests__/
│   │   ├── use-auth.test.ts
│   │   ├── use-categories.test.ts
│   │   └── use-supabase-tasks.test.ts
│   ├── use-auth.ts
│   ├── use-categories.ts
│   └── use-supabase-tasks.ts
├── lib/
│   ├── __tests__/
│   │   └── supabase.test.ts
│   └── supabase.ts
└── __tests__/
    └── test-utils.tsx
```

## Test Categories

### 1. Hook Tests

**Critical hooks tested:**
- `useAuth` - Authentication state management
- `useSupabaseTasks` - Task CRUD operations and caching
- `useCategories` - Category management

**Coverage includes:**
- State initialization
- CRUD operations
- Error handling
- Caching behavior
- Offline functionality
- Data validation

### 2. Component Tests

**Key components tested:**
- `TaskItem` - Individual task rendering and interactions
- `TaskList` - Task list management and filtering

**Coverage includes:**
- Rendering with various props
- User interactions
- Performance optimizations (React.memo)
- Accessibility features
- Error states

### 3. Utility Tests

**Utilities tested:**
- Supabase client configuration
- Error handling functions
- Data transformation utilities

## Testing Utilities

### Test Utils (`src/__tests__/test-utils.tsx`)

Provides common testing helpers:

```typescript
// Custom render with providers
render(<Component />, { wrapper: TestWrapper });

// Mock data factories
const task = createMockTask({ title: 'Test Task' });
const category = createMockCategory({ name: 'Work' });

// Utility functions
await waitForLoadingToFinish();
mockLocalStorage({ key: 'value' });
```

### Mocking Strategy

**External Dependencies:**
- Supabase client and auth methods
- Next.js navigation hooks
- Browser APIs (localStorage, matchMedia, navigator.onLine)
- Date utilities (date-fns)

**Mock Patterns:**
```typescript
// Supabase operations
jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
  getCurrentUserId: jest.fn(),
  handleSupabaseError: jest.fn()
}));

// Navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/'
}));
```

## Coverage Goals

**Current Coverage Thresholds:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**Priority Areas:**
1. Critical business logic (task management, auth)
2. Error handling paths
3. User interaction flows
4. Performance optimizations

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names that explain the scenario
- Follow AAA pattern: Arrange, Act, Assert

### 2. Mock Management
- Clear mocks between tests using `beforeEach`
- Mock at the appropriate level (module vs function)
- Verify mock calls when testing integrations

### 3. Async Testing
- Use `waitFor` for async state changes
- Test loading states and error conditions
- Handle promise rejections properly

### 4. Component Testing
- Test user interactions, not implementation details
- Verify accessibility attributes
- Test error boundaries and edge cases

### 5. Performance Testing
- Verify memoization works correctly
- Test that expensive operations are optimized
- Ensure components don't re-render unnecessarily

## Common Patterns

### Testing Hooks
```typescript
const { result } = renderHook(() => useCustomHook());

act(() => {
  result.current.someAction();
});

expect(result.current.state).toBe(expectedValue);
```

### Testing Components
```typescript
render(<Component prop="value" />);

const button = screen.getByRole('button', { name: /click me/i });
fireEvent.click(button);

expect(screen.getByText('Expected result')).toBeInTheDocument();
```

### Testing Error States
```typescript
// Mock error response
mockSupabaseClient.from().select.mockRejectedValue(new Error('Network error'));

render(<Component />);

expect(await screen.findByText(/error occurred/i)).toBeInTheDocument();
```

## Debugging Tests

### Common Issues
1. **Act warnings**: Wrap state updates in `act()`
2. **Memory leaks**: Clear timers and subscriptions
3. **Mock persistence**: Reset mocks between tests
4. **Async timing**: Use proper waiting utilities

### Debug Tools
```typescript
// Debug rendered output
screen.debug();

// Log queries
screen.logTestingPlaygroundURL();

// Check what's in the document
console.log(container.innerHTML);
```

## Next Steps

### Week 2 Priorities
1. Add integration tests for complete user flows
2. Implement visual regression testing
3. Add performance benchmarking
4. Set up CI/CD test automation

### Future Enhancements
1. E2E testing with Playwright
2. API contract testing
3. Accessibility testing automation
4. Load testing for performance

This testing infrastructure provides a solid foundation for maintaining code quality and preventing regressions as the application evolves.