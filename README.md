# Guess the Word Together

A playground for a bunch of tech used for developing react SPA featuring real-time collaboration.

A collaborative multiplayer word guessing game where players work together to guess a secret word chosen by AI.
Players can see each other typing in real-time and ask yes/no questions to narrow down the possibilities.

### Prerequisites

- **Node.js** 18+ and npm
- **Ollama** for AI-powered responses

### How to Run this

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
- Build container, setup CI/CD
- Yjs collaboration with WebSocket
- Bun for the server
- MCP API
- Code splitting & lazy loading
-

### Interesting feature
- monorepo using npm workspaces

Static typing:
- [Typesafe action definitions](frontend/src/contexts/AppContext/actions.ts)
- [Typesafe websocket events protocol between frontend and backend]()


### Bundler
Chosen:
- Vite
Alternatives:
- esbuild
- Webpack
- Rollup
- Parcel
- Snowpack

### Linting and formatting
Chosen:
- ESLint (+ typescript-eslint) + Prettier
Alternatives:
- Biome - a new all-in-one tool, but ecosystem of plugins is not mature yet

### Server
- **Bun** (TODO)

### State Management
Chosen:
- React Context + useReducer 
Alternatives:
- Redux Toolkit
- Zustand

### Collaboration
- **Yjs** for real-time collaborative features
- **WebSocket** for real-time communication

### Backend
- Express
Alternatives:
- Koa
- Fastify

### Monorepo
Chosen:
- **npm workspaces** 
Alternatives:
- Nx
- Turborepo

### Frontend/Backend Communication
- shared TS interfaces in the `shared` package (TODO)



### Architecture

- **Monorepo** with workspaces for clean separation
- **React Context** + useReducer for state management
- **Component-based** UI with reusable pieces
- **TypeScript** throughout for type safety
- **Socket.io rooms** for multiplayer sessions

## 🤖 AI Configuration

The game uses Ollama with the `llama3.2:3b` model for:
- **Word generation** - Picking random words suitable for guessing
- **Question answering** - Responding to yes/no questions
- **Word categorization** - Providing helpful category hints

### Fallback Mode
If Ollama isn't running, the game falls back to:
- Pre-defined word list for word selection
- Simple rule-based question answering

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both Ollama and fallback mode
5. Submit a pull request

## 🐛 Troubleshooting

### "Connection refused" errors
- Make sure Ollama is running: `ollama serve`
- Check if the model is installed: `ollama list`
- Verify Ollama is on port 11434: `curl http://localhost:11434`
