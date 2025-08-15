# Guess the Word Together

A collaborative multiplayer word guessing game where players work together to guess a secret word chosen by AI. Players can see each other typing in real-time and ask yes/no questions to narrow down the possibilities.

## 🎮 How It Works

1. **AI picks a secret word** and gives you a category hint
2. **Players ask yes/no questions** like "Is it alive?" or "Is it bigger than a car?"
3. **AI responds** with Yes, No, Maybe, or Unclear
4. **Make a guess** when you think you know: "Is it a phone?"
5. **Win and repeat** - New round starts automatically with a new word!

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Ollama** for AI-powered responses

### 1. Install Ollama

```bash
# macOS
brew install ollama

# Or download from: https://ollama.ai/download
```

### 2. Set up Ollama

```bash
# Start Ollama service (keep this running)
ollama serve

# In another terminal, pull the required model
ollama pull llama3.2:3b

# Test it works
ollama run llama3.2:3b "Hello!"
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all package dependencies
npm run install:all
```

### 4. Start the Servers

```bash
# Start both frontend and backend
npm run dev

# Or run separately:
# Backend: cd backend && npm run dev
# Frontend: cd frontend && npm run dev
```

### 5. Play!

- Open http://localhost:5173
- The game starts automatically when you connect
- Ask questions and make guesses!

## 🏗️ Project Structure

```
guess-the-word-together/
├── frontend/           # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── context/    # Game state management
│   │   └── ...
├── backend/            # Express + Socket.io + Ollama
│   ├── src/
│   │   ├── services/   # AI service
│   │   └── ...
├── shared/             # Shared TypeScript types
└── package.json        # Monorepo configuration
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time communication
- **Yjs** for collaborative typing (planned)

### Backend
- **Express** + TypeScript server
- **Socket.io** for real-time multiplayer
- **Ollama** for local AI responses
- **Yjs WebSocket** for collaborative features

### AI
- **Ollama** with Llama 3.2 3B model
- Fallback word list when AI unavailable
- Smart question answering and word generation

## 🎯 Game Features

- **Real-time multiplayer** - Multiple players in shared room
- **AI-powered gameplay** - Intelligent responses to questions
- **Collaborative typing** - See what others are typing (coming soon)
- **Continuous rounds** - Game never stops, new words automatically
- **Smart win detection** - AI recognizes correct guesses
- **Category hints** - AI categorizes words to help players

## 🔧 Development

### Scripts

```bash
npm run dev          # Start both servers
npm run build        # Build all packages
npm run install:all  # Install all dependencies
```

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
