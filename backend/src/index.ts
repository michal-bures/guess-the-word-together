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

  // Send current state or welcome message
  const currentSession = aiService.getGameSession(roomId);
  if (currentSession) {
    // Send current game state to the newly connected user
    socket.emit('game-state-sync', {
      roundNumber: currentSession.roundNumber,
      category: currentSession.category,
      questions: currentSession.questions
    });

    socket.emit('status-message', `Welcome back! Round ${currentSession.roundNumber}: Category: ${currentSession.category}`);
  } else {
    // No active game - send welcome message
    socket.emit('status-message', 'Welcome! Click "New Round" to start playing.');
  }

  // Start a new game when requested
  socket.on('start-game', async () => {
    try {
      const gameInfo = await aiService.startNewGame(roomId);

      // Notify all players of new round
      io.to(roomId).emit('round-started', {
        round: gameInfo.roundNumber,
        category: gameInfo.category,
        message: `🎮 Round ${gameInfo.roundNumber} started! I'm thinking of ${gameInfo.category === 'unknown' ? 'something' : `a ${gameInfo.category}`}... Ask yes/no questions to guess what it is!`
      });

      console.log(`Game started in ${roomId}: ${gameInfo.word} (${gameInfo.category})`);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', { message: 'Failed to start game' });
    }
  });

  // Handle question with proper ID tracking
  socket.on('ask-question', async (data: { questionId: string, question: string }) => {
    try {
      const result = await aiService.answerQuestion(roomId, data.question, socket.id);

      if (result.isCorrectGuess) {
        // Send answer to the specific question first
        socket.emit('question-answered', {
          questionId: data.questionId,
          answer: `🎉 ${result.explanation}!`,
          isCorrectGuess: true
        });

        // Then notify everyone of the win
        io.to(roomId).emit('game-won', {
          winner: socket.id,
          word: result.explanation,
          message: `🎉 ${result.explanation}! Click "New Round" to play again.`
        });
      } else {
        socket.emit('question-answered', {
          questionId: data.questionId,
          answer: result.answer,
          isCorrectGuess: false
        });
      }
    } catch (error) {
      console.error('Error:', error);
      socket.emit('question-answered', {
        questionId: data.questionId,
        answer: 'Sorry, something went wrong. Try again!',
        isCorrectGuess: false
      });
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
