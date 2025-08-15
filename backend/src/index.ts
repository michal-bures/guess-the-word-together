import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import WebSocket, { WebSocketServer } from 'ws';
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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'Total users:', io.engine.clientsCount);

  socket.on('test-message', (message: string) => {
    console.log('Received test message:', message);
    socket.emit('test-response', `Server received: ${message}`);
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
