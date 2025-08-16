import express from 'express';
import {createServer} from 'http';
import {Server, Socket} from 'socket.io';
import cors from 'cors';
import {WebSocketServer} from 'ws';
import {wordGameAI} from './services/WordGameAI';
import {gameDirector} from './services/GameDirector';
import type {ClientToServerEvents, ServerToClientEvents} from 'shared';

const app = express();
const server = createServer(app);

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

const PORT = process.env.PORT || 3001;

async function handleStartNewGame(roomId: string, socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
    try {
        const word = await wordGameAI.pickRandomWord();
        const category = await wordGameAI.categorizeWord(word);
        const gameInfo = gameDirector.startNewGame(roomId, word, category);

        // Notify all players of new round
        io.to(roomId).emit('game-state-sync', {
            wordCategory: gameInfo.wordCategory,
            questions: []
        });

        console.log(`Game started in ${roomId}: ${gameInfo.secretWord} (${gameInfo.wordCategory})`);
    } catch (error) {
        console.error('Error starting game:', error);
        socket.emit('error', {message: 'Failed to start game'});
    }
}

io.on('connection', async (socket) => {
    console.log('User connected:', socket.id, 'Total users:', io.engine.clientsCount);

    // Join default room for now (later we'll add room management)
    const roomId = 'main-room';
    socket.join(roomId);

    // Send current state or welcome message
    const currentSession = gameDirector.getGameSession(roomId);
    if (currentSession) {
        // Send current game state to the newly connected user
        socket.emit('game-state-sync', {
            wordCategory: currentSession.wordCategory,
            questions: currentSession.questions,
            gameOver: currentSession.gameOver
        });
    } else {
        await handleStartNewGame(roomId, socket)
    }

    // Start a new game when requested
    socket.on('start-game', () => handleStartNewGame(roomId, socket));

    // Handle question with proper ID tracking
    socket.on('ask-question', async (data: { questionId: string, question: string }) => {
        const session = gameDirector.getGameSession(roomId);
        if (!session) {
            await handleStartNewGame(roomId, socket)
            throw new Error('No active game session');
        }

        gameDirector.addQuestionToSession(roomId, {
            id: data.questionId,
            question: data.question,
            userId: socket.id!,
        })

        const aiResponse = await wordGameAI.answerQuestion(data.question, session.secretWord);

        gameDirector.updateQuestion(roomId, data.questionId, {
            answer: aiResponse.answer,
            isCorrectGuess: aiResponse.isCorrectGuess
        });

        socket.emit('question-answered', {
            questionId: data.questionId,
            ...aiResponse,
        });

        if (aiResponse.isCorrectGuess) {
            // Game over!
            gameDirector.setGameOver(roomId, socket.id!)
            io.to(roomId).emit('game-over', gameDirector.getGameSession(roomId)!.gameOver!)
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id, 'Total users:', io.engine.clientsCount);
    });
});

// Set up Yjs WebSocket server
const wss = new WebSocketServer({port: 1234});

wss.on('connection', (ws, req) => {
    //TODO
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Yjs WebSocket server running on ws://localhost:1234`);
});
