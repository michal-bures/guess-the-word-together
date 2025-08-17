# Development Guide

## Project Overview

**Guess the Word Together** is a collaborative multiplayer word guessing game built as a modern monorepo showcasing real-time web development patterns.

### Architecture

This is a TypeScript monorepo with three packages:
- **frontend**: React SPA with Vite and TailwindCSS
- **backend**: Koa.js server with Socket.io and Ollama AI integration  
- **shared**: Common types and event definitions

### Quick Start Commands

```bash
# Development
npm run dev               # Start all services concurrently
npm run build            # Build all packages
npm run test             # Run all tests
npm run lint             # Lint and fix all packages
npm run format           # Format all packages

# Individual packages (use --filter)
bun run --filter=frontend dev
bun run --filter=backend test
bun run --filter=shared build
```

### Project Structure

```
packages/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── contexts/       # React Context (AppContext)
│   │   ├── hooks/          # Custom hooks
│   │   └── test/           # Test utilities
│   ├── vite.config.ts      # Vite configuration
│   └── tailwind.config.js  # TailwindCSS config
├── backend/            # Node.js server
│   ├── src/
│   │   ├── services/       # Game logic (GameDirector, WordGameAI)
│   │   ├── index.ts        # Server entry point
│   │   └── types.ts        # Backend-specific types
│   └── data/
│       └── word-list.txt   # Game words database
└── shared/             # Shared type definitions
    └── src/types/
        ├── gameSessionState.ts  # Game state types
        └── socketIoEvents.ts    # Socket.io event types
```

### Key Technologies

- **Package Manager**: Bun (fastest, with workspace support)
- **Frontend**: React 19 + Vite + TailwindCSS
- **Backend**: Koa.js + Socket.io + Ollama AI
- **Testing**: Vitest + React Testing Library + happy-dom
- **Real-time**: Socket.io + Yjs (collaborative editing)
- **Monorepo**: Bun workspaces with catalog for dependency unification

### Development Patterns

#### State Management
- **Frontend**: React Context (`AppContext`) with reducer pattern
- **Backend**: In-memory game sessions managed by `GameDirector`
- **Shared**: TypeScript interfaces for type safety across packages

#### Type Safety
- Socket.io events are fully typed using shared interfaces
- All actions are type-safe using discriminated unions
- Import restrictions prevent dist/ folder access via ESLint

#### AI Integration  
- Uses Ollama (llama3.2:3b model) for word categorization and question answering
- Fallback handling for AI service unavailability
- File: `packages/backend/src/services/WordGameAI.ts`

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

## Code Conventions

### Import Rules
- Never import from `dist/` folders - use proper package imports
- Never include file extensions in TypeScript imports
- Use workspace references for monorepo packages: `import { ... } from 'shared'`

### File Naming
- Components: PascalCase (`GameStatusMessage.tsx`)
- Utilities: camelCase (`useScrollToBottom.ts`)
- Tests: Same name as source + `.test.tsx`
- Types: Descriptive names in `/types` folders

### ESLint Configuration
- Shared root config with package-specific overrides
- Prettier integration for consistent formatting
- Unused variable prefixes with `_` are ignored
- TypeScript strict mode enabled

## Prerequisites & Setup

### Required Software
- **Bun** (package manager and runtime)
- **Ollama** for AI functionality

### First-time Setup
```bash
# Install Ollama (macOS)
brew install ollama
ollama serve &
ollama pull llama3.2:3b

# Install dependencies and start development
npm install
npm run dev
```

### Docker Support
- Single unified container for frontend + backend
- Health check endpoint: `/health`
- Ports: 3001 (app), 1234 (WebSocket)
