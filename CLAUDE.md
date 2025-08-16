# Development Guide

## Testing Patterns

### React Component Testing

When writing tests for React components, follow these patterns established in our test suite:

#### 1. Test Structure

Use a clear three-part structure in each test:

```typescript
it('describes what the test does', () => {
    // 1. Setup - declare state/mocks first
    const state = mockAppState({
        gameState: {
            wordCategory: 'vehicles',
            gameOver: undefined,
            questions: []
        }
    })
    
    // 2. Action - render the component
    renderWithMockAppState(<Component />, state)
    
    // 3. Assertions - verify expected behavior
    expect(screen.getByText("Expected text")).toBeInTheDocument()
    expect(screen.queryByText('Hidden text')).not.toBeInTheDocument()
})
```

#### 2. State Management in Tests

**✅ Good: Declare state separately**
```typescript
const state = mockAppState({
    socket: mockSocket({ connected: false })
})
renderWithMockAppState(<GameStatusMessage />, state)
```

**❌ Avoid: Inline state in render calls**
```typescript
renderWithMockAppState(<GameStatusMessage />, {
    socket: { connected: false }
})
```

#### 3. Testing Context-Dependent Components

Use real context providers instead of mocking hooks:

**✅ Good: Use helper with real context**
```typescript
// Helper function that provides real AppContext.Provider
function renderWithMockAppState(component, state, mockFunctions) {
    const contextValue = {
        state: createMockState(state),
        startNewRound: mockFunctions?.startNewRound || vi.fn(),
        // ... other functions
    }
    
    return render(
        <AppContext.Provider value={contextValue}>
            {component}
        </AppContext.Provider>
    )
}
```

**❌ Avoid: Mocking hooks directly**
```typescript
vi.mock('../contexts/AppContext', () => ({
    useAppContext: vi.fn()
}))
```

#### 4. Testing User Interactions

Test functions are called when users interact with components:

```typescript
it('calls function when button is clicked', () => {
    const mockFunction = vi.fn()
    const state = mockAppState({
        gameState: { gameOver: { secretWord: 'cat', winnerId: 'player1' } }
    })
    
    renderWithMockAppState(<Component />, state, { startNewRound: mockFunction })
    
    const button = screen.getByText('Play Again')
    fireEvent.click(button)
    
    expect(mockFunction).toHaveBeenCalledOnce()
})
```

#### 5. Testing Different States

Cover all conditional rendering paths:

```typescript
describe('Component', () => {
    it('shows loading state when disconnected', () => {
        const state = mockAppState({
            socket: mockSocket({ connected: false })
        })
        renderWithMockAppState(<Component />, state)
        expect(screen.getByText('Reconnecting...')).toBeInTheDocument()
    })
    
    it('shows success state when game is won', () => {
        const state = mockAppState({
            gameState: { gameOver: { secretWord: 'cat', winnerId: 'player1' } }
        })
        renderWithMockAppState(<Component />, state)
        expect(screen.getByText('🎉 You guessed it!')).toBeInTheDocument()
    })
    
    it('shows active state during gameplay', () => {
        const state = mockAppState({
            gameState: { wordCategory: 'animals', gameOver: undefined }
        })
        renderWithMockAppState(<Component />, state)
        expect(screen.getByText("I'm thinking about some animals...")).toBeInTheDocument()
    })
})
```

#### 6. What NOT to Test

Avoid testing implementation details:

**❌ Don't test CSS classes**
```typescript
expect(container).toHaveClass('flex', 'items-center') // Too brittle
```

**❌ Don't test internal state**
```typescript
expect(component.state.internalValue).toBe(true) // Implementation detail
```

**✅ Test user-visible behavior**
```typescript
expect(screen.getByText('Expected text')).toBeInTheDocument()
expect(screen.queryByText('Hidden text')).not.toBeInTheDocument()
```

#### 7. Mock External Dependencies

Mock external services to prevent side effects:

```typescript
// Mock socket.io to prevent real network calls
vi.mock('socket.io-client', () => ({
    io: vi.fn(() => ({
        on: vi.fn(),
        emit: vi.fn(),
        close: vi.fn()
    }))
}))
```

#### 8. Test File Organization

- Place tests next to source files: `Component.tsx` → `Component.test.tsx`
- Use descriptive test names that explain the scenario
- Group related tests with `describe` blocks
- Use `beforeEach` to reset mocks between tests

Example from `GameStatusMessage.test.tsx`:
```typescript
describe('GameStatusMessage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })
    
    // Tests grouped by functionality
    it('shows reconnecting message when socket is disconnected', () => { ... })
    it('shows game over message with secret word when game is won', () => { ... })
    it('shows playing message with word category when game is active', () => { ... })
    it('calls startNewRound when Play Again button is clicked', () => { ... })
})
```

### Benefits of This Approach

1. **Readable**: Clear separation between setup, action, and assertion
2. **Maintainable**: Easy to modify test data without parsing render calls
3. **Realistic**: Uses real context providers instead of mocks
4. **Focused**: Tests behavior, not implementation details
5. **Debuggable**: Clear state declarations make issues easy to trace