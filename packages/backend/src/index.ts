import { createServer } from 'http'
import { createKoaApp, createSocketServer } from './server'
import { createYjsWebSocketServer } from './websocket/yjsServer'
import { config } from './config'
import type { Server, Socket } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from 'shared'
import { GameController } from './controllers/GameController'
import { WordGameAI } from './services/WordGameAI'
import { createAIModel } from './services/AIModel/factory'
import { GameSessionsManager } from './services/GameSessionsManager'
import { redact } from './utils'

async function startServer(): Promise<void> {
    try {
        console.log('Starting with config:', {
            ...config,
            openAIApiKey: redact(config.openAIApiKey)
        })

        // Create Koa app and HTTP server
        const app = createKoaApp()
        const httpServer = createServer(app.callback())

        // Create and setup the GameController with Socket.IO
        const io = createSocketServer(httpServer)
        const gameController = await createGameController(io)
        io.on('connection', async (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
            console.log('new connection:', socket.id, socket.client.conn.remoteAddress)
            const roomId = config.defaultRoomId
            // Delegate connection handling to controller
            await gameController.handleConnection(socket, roomId)
        })

        // Create Yjs WebSocket server
        createYjsWebSocketServer()

        // Start HTTP server
        httpServer.listen(config.port, () => {
            console.log(`Server running on http://localhost:${config.port}`)
        })

        // Graceful shutdown handling
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully')
            httpServer.close(() => {
                console.log('HTTP server closed')
                process.exit(0)
            })
        })

        process.on('SIGINT', () => {
            console.log('SIGINT received, shutting down gracefully')
            httpServer.close(() => {
                console.log('HTTP server closed')
                process.exit(0)
            })
        })
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

async function createGameController(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    const aiModel = await createAIModel(config.aiModel)
    const ai = new WordGameAI(aiModel)
    const gameSessions = new GameSessionsManager()
    const gameController = new GameController(io, gameSessions, ai)
    return gameController
}

// Start the server
startServer()
