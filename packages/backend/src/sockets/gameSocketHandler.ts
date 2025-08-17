import type { Server, Socket } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from 'shared'
import { GameController } from '../controllers/GameController'
import { config } from '../config'

export function setupGameSocketHandlers(io: Server<ClientToServerEvents, ServerToClientEvents>): void {
    const gameController = new GameController(io)

    io.on('connection', async (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
        console.log('User connected:', socket.id, 'Total users:', io.engine.clientsCount)

        // Join default room for now (later we'll add room management)
        const roomId = config.defaultRoomId
        gameController.joinRoom(socket, roomId)

        // Send current state or start new game
        const currentGameState = gameController.getCurrentGameState(roomId)
        if (currentGameState) {
            // Send current game state to the newly connected user
            socket.emit('game-state-sync', currentGameState)
        } else {
            await gameController.startNewGame(roomId, socket)
        }

        // Handle start game requests
        socket.on('start-game', async () => {
            try {
                await gameController.startNewGame(roomId, socket)
            } catch (error) {
                console.error('Error handling start-game:', error)
                socket.emit('error', { message: 'Failed to start game' })
            }
        })

        // Handle questions
        socket.on('ask-question', async (data: { questionId: string; question: string }) => {
            try {
                await gameController.handleQuestion({
                    roomId,
                    questionId: data.questionId,
                    question: data.question,
                    userId: socket.id!,
                    socket
                })
            } catch (error) {
                console.error('Error handling question:', error)
                socket.emit('error', { message: 'Failed to process question' })
            }
        })

        // Handle give up
        socket.on('give-up', () => {
            try {
                gameController.handleGiveUp(roomId, socket.id!)
            } catch (error) {
                console.error('Error handling give up:', error)
                socket.emit('error', { message: 'No active game session' })
            }
        })

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id, 'Total users:', io.engine.clientsCount)
        })
    })
}