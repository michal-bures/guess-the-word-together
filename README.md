# Guess the Word Together

A playground for a bunch of tech used for developing react SPA featuring real-time collaboration.

A collaborative multiplayer word guessing game where players work together to guess a secret word chosen by AI.
Players can see each other typing in real-time and ask yes/no questions to narrow down the possibilities.

## Prerequisites

- **Node.js** 18+ and npm
- **Ollama** for AI-powered responses

## How to Run this

```bash
  # Install and setup Ollama (macOS)
  brew install ollama

  # Start Ollama service (keep running in background)
  ollama serve &

  # Pull required model and test
  ollama pull llama3.2:3b
  ollama run llama3.2:3b "Hello!"

  # Install all dependencies
  npm install && npm run install

  # Start both frontend and backend servers
  npm run dev
```

## 🛠️ Tech Stack

### TODO
- Switch from express to Koa or Buns built-in server or maybe Fastify?
- Build container, setup CI/CD
- Yjs collaboration with WebSocket
- MCP API
- Code splitting & lazy loading
- Tracking test runtime duration, coverage
- Tracking bundle size

### Points of interest
Static typing:
- [Typesafe action definitions](packages/frontend/src/contexts/AppContext/actions.ts)
- [Typesafe websocket events protocol between frontend and backend](packages/shared/src/types/socketIoEvents.ts)

### Tech stack choices

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
  - why vitest:
    - much faster for larger projects compared to jest
    - easy to use with Vite
    - jest-like API
    - more feature-complete than bun test runner

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
- **React Context** for state management
  - alternatives: Redux, Zustand, MobX
  - why React Context:
    - simple and lightweight for smaller applications
    - no additional dependencies
