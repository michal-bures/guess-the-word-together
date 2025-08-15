import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import WebSocket, { WebSocketServer } from 'ws';
import { aiService } from './services/aiService';
const app = express();
const server = createServer(app);

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

io.on('connection', async (socket) => {
  console.log('User connected:', socket.id, 'Total users:', io.engine.clientsCount);

  // Join default room for now (later we'll add room management)
  const roomId = 'main-room';
  socket.join(roomId);

  // Auto-start game if no active session exists
  const currentSession = aiService.getGameSession(roomId);
  if (!currentSession) {
    try {
      const gameInfo = await aiService.startNewGame(roomId);
      io.to(roomId).emit('test-response', `🎮 Welcome! Round ${gameInfo.roundNumber}: I'm thinking of ${gameInfo.category === 'unknown' ? 'something' : `a ${gameInfo.category}`}... Ask yes/no questions to guess what it is!`);
      console.log(`Auto-started game in ${roomId}: ${gameInfo.word} (${gameInfo.category})`);
    } catch (error) {
      console.error('Error auto-starting game:', error);
    }
  }

  // Start a new game when first player joins
  socket.on('start-game', async () => {
    try {
      const gameInfo = await aiService.startNewGame(roomId);

      // Notify all players in the room
      io.to(roomId).emit('game-started', {
        roundNumber: gameInfo.roundNumber,
        category: gameInfo.category,
        message: `Round ${gameInfo.roundNumber} started! I'm thinking of ${gameInfo.category === 'unknown' ? 'something' : `a ${gameInfo.category}`}...`
      });

      console.log(`Game started in ${roomId}: ${gameInfo.word} (${gameInfo.category})`);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', { message: 'Failed to start game' });
    }
  });

  // Handle questions from players
  socket.on('ask-question', async (data: { question: string }) => {
    try {
      const result = await aiService.answerQuestion(roomId, data.question, socket.id);

      if (result.isCorrectGuess) {
        // Someone guessed correctly!
        io.to(roomId).emit('correct-guess', {
          winner: socket.id,
          word: result.explanation,
          message: `🎉 Correct! ${result.explanation}`
        });

        // Start new round automatically after a brief delay
        setTimeout(async () => {
          const gameInfo = await aiService.startNewGame(roomId);
          io.to(roomId).emit('game-started', {
            roundNumber: gameInfo.roundNumber,
            category: gameInfo.category,
            message: `Round ${gameInfo.roundNumber} started! I'm thinking of ${gameInfo.category === 'unknown' ? 'something' : `a ${gameInfo.category}`}...`
          });
        }, 3000);
      } else {
        // Normal Q&A response
        io.to(roomId).emit('ai-response', {
          answer: result.answer,
          originalQuestion: data.question,
          playerId: socket.id
        });
      }
    } catch (error) {
      console.error('Error processing question:', error);
      socket.emit('error', { message: 'Failed to process question' });
    }
  });

  // Legacy support for the current frontend
  socket.on('test-message', async (message: string) => {
    try {
      const result = await aiService.answerQuestion(roomId, message, socket.id);

      if (result.isCorrectGuess) {
        socket.emit('test-response', `🎉 ${result.explanation}! Starting new round...`);

        // Start new round
        setTimeout(async () => {
          const gameInfo = await aiService.startNewGame(roomId);
          io.to(roomId).emit('test-response', `Round ${gameInfo.roundNumber}: I'm thinking of ${gameInfo.category === 'unknown' ? 'something' : `a ${gameInfo.category}`}...`);
        }, 2000);
      } else {
        socket.emit('test-response', result.answer);
      }
    } catch (error) {
      console.error('Error:', error);
      socket.emit('test-response', 'Sorry, something went wrong. Try again!');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id, 'Total users:', io.engine.clientsCount);
  });
});

// Set up Yjs WebSocket server
const wss = new WebSocketServer({ port: 1234 });

wss.on('connection', (ws, req) => {
  //TODO
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Yjs WebSocket server running on ws://localhost:1234`);
});
