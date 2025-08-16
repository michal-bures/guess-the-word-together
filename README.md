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

### Package manager for monorepo
**Bun**

Alternatives:
- npm
  - Nx
  - Turborepo

- pnpm

### Bundler

**Vite**

Alternatives:
- Bun
- Esbuild
- Webpack
- Rollup
- Parcel

### Linting and formatting

**ESLint (+ typescript-eslint) + Prettier**

Alternatives:
- Biome - a new all-in-one tool, but ecosystem of plugins is not mature yet

### Server
- **Bun** (TODO)

Alternatives:
- Express
- Koa
- Fastify

### Frontend State Management
plain react context & useReducer + lightweight custom wrapper for defining actions and reducers

Alternatives:
- Redux Toolkit
- Zustand

### Realtime collaboration
- **Yjs** for real-time collaborative features
- **socket.io** for websockets (+ fallback to long-polling)


## 🐛 Troubleshooting

### "Connection refused" errors
- Make sure Ollama is running: `ollama serve`
- Check if the model is installed: `ollama list`
- Verify Ollama is on port 11434: `curl http://localhost:11434`
