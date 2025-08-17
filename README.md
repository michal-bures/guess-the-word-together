# Guess the Word Together

A playground for a bunch of tech used for developing react SPA featuring real-time collaboration.

A collaborative multiplayer word guessing game where players work together to guess a secret word chosen by AI.
Players can see each other typing in real-time and ask yes/no questions to narrow down the possibilities.

Try it at https://guess-the-word-together.onrender.com/

## Running locally

Requires:
- **Bun** v1.0+
- **AI Provider**: Choose either OpenAI API (cloud) or Ollama (local)

### Option 1: Using OpenAI API (Recommended)
```bash
  # Get your OpenAI API key from https://platform.openai.com/api-keys
  # Set environment variables (or place in a `.env` file)
  export AI_MODEL=openai
  export OPENAI_API_KEY=your-api-key-here

  # Install all dependencies
  bun install

  # Start both frontend and backend servers
  bun run dev
```

### Option 2: Using Local Ollama
```bash
  # Install and setup Ollama (macOS)
  brew install ollama
  ollama serve &
  ollama pull llama3.2:3b

  # Set environment variables
  export AI_MODEL=ollama
  export OLLAMA_BASE_URL=http://localhost:11434

  # Install all dependencies
  bun install

  # Start both frontend and backend servers
  bun run dev
```

## Running in Docker

Requires:
- Docker environment (such as Rancher Desktop, Docker Desktop, etc.)
- **AI Provider**: Choose either OpenAI API or Ollama

### Using OpenAI API (Recommended)
```bash
# Set environment variables
export AI_MODEL=openai
export OPENAI_API_KEY=your-api-key-here

# Start the application
docker-compose up
```

### Using Local Ollama
```bash
# Set environment variables
export AI_MODEL=ollama
export OLLAMA_BASE_URL=http://host.docker.internal:11434

# Make sure Ollama is running on your host
ollama serve &
ollama pull llama3.2:3b

# Start the application
docker-compose up
```

## 🛠️ Tech Stack

### TODO
- ✅ Switch to configurable AI providers (OpenAI API + local Ollama)
- Yjs collaboration with WebSocket
- MCP API
- Code splitting & lazy loading
- Tracking test runtime duration, coverage
- Tracking bundle size
- Tagging & versioning releases

### Points of interest
Dependency management:
- Using buns `catalog` to unify dev dependency versions (such as typescript) across all packages 
- Using `linkWorkspacePackages = true` to symlink local packages in monorepo to speedup and simplify development
  - this also makes bun use a single central `node_modules` folder for all packages

CI pipeline:
- App is built as a single Docker image running bun, which serves both frontend and backend
- For maximum speed, checks and build runs in parallel, deploy is triggered if everything passes
- TODO: for better scaling & availability, static assets could be uploaded to CDN and served from there instead of the backend container

Static typing:
- [Typesafe action definitions](packages/frontend/src/contexts/AppContext/actions.ts)
- [Typesafe websocket events protocol between frontend and backend](packages/shared/src/types/socketIoEvents.ts)

### Technical choices

Building running, and testing:
- **[Bun](https://bun.com/)** as package manager for monorepo, server runtime and test runtime
  - package manager alternatives: pnpm, nx, turborepo
  - server runtime alternatives: node.js, deno
  - why bun: 
    - by far the fastest package manager compared to all alternatives
    - also the fastest server runtime
    - built-in TypeScript support
    - compared to deno: 
        - better compatibility with npm packages
        - better performance
- **[Vite](https://vite.dev/)** as bundler and dev server for frontend
  - alternatives: bun, webpack, rollup, esbuild, parcel
  - why vite:
    - fast hot module replacement
    - more feature-complete for React applications then bun
    - can use bun as runtime (`bunx --bun vite`) for even faster builds
- **[Vitest](https://vitest.dev/)** as unit test runner
  - alternatives: jest, bun
  - with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) as industry standard way to test React components
  - with [happy-dom](https://github.com/capricorn86/happy-dom) as a much faster alternative to JSDOM
  - why vitest:
    - much faster for larger projects compared to jest
    - easy to use with Vite
    - jest-like API
    - more feature-complete than bun test runner
- **[GitHub Actions](https://github.com/features/actions)** for CI/CD

Libraries and frameworks:
- **[Koa](https://koajs.com/)** as web server framework
  - alternatives: express, fastify, bun built-in server
  - why Koa:
    - modern async/await syntax and better performance compared to express
  - why Express:
    - the most mature ecosystem with many middleware options
  - why Fastify:
    - built-in schema validation and serialization
- **[Socket.io](https://socket.io/)** for real-time communication
  - alternatives: ws, bun websocket, deno websocket
  - why socket.io:
    - mature ecosystem with many features out of the box
    - supports fallbacks to long-polling
    - easy to use with Yjs for real-time collaboration
- **[Yjs](https://docs.yjs.dev/)** for real-time collaborative features
- **[Tailwind](https://tailwindcss.com/)** for styling
  - alternatives: styled-components, emotion, CSS modules
  - why Tailwind:
    - ruthlessly efficient for rapid UI development
    - but best to replace with proper UI framework for larger applications
    
- **React Context** for state management
  - alternatives: Redux, Zustand, MobX
  - why React Context:
    - simple and lightweight for smaller applications
    - no additional dependencies
