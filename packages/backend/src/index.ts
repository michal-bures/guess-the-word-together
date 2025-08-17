import { createServer } from 'http'
import { createKoaApp, createSocketServer } from './server'
import { createYjsWebSocketServer } from './websocket/yjsServer'
import { config } from './config'
import type { Socket } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from 'shared'
import { GameController } from './controllers/GameController'

async function startServer(): Promise<void> {
    try {
        // Create Koa app and HTTP server
        const app = createKoaApp()
        const httpServer = createServer(app.callback())

        // Create and setup Socket.io server
        const io = createSocketServer(httpServer)
        const gameController = new GameController(io)
        io.on('connection', async (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
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

// Start the server
startServer()
