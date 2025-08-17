import type { Server, Socket } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents, GameSessionState } from 'shared'
import { WordGameAI } from '../services/WordGameAI'
import { GameSessionsManager } from '../services/GameSessionsManager'
import { BackendGameSessionState, GameSocket } from '../types'

export class GameController {
    constructor(
        private io: Server<ClientToServerEvents, ServerToClientEvents>,
        private gameSessions: GameSessionsManager,
        private ai: WordGameAI
    ) {}

    async handleConnection(socket: GameSocket, roomId: string): Promise<void> {
        console.log('User connected:', socket.id, 'Total users:', this.io.engine.clientsCount)

        // Start new game if needed
        const publicGameState = await this.getOrCreateGameSession(roomId, socket)

        // Join room
        socket.join(roomId)
        const user = this.gameSessions.addUserToSession(roomId, socket.id!)

        if (!user || !publicGameState) {
            console.error(`Failed to add user ${socket.id} to room ${roomId}`)
            socket.emit('error', { message: 'Failed to join game' })
            return
        }

        // Sync game state with the user
        socket.emit('game-state-sync', publicGameState)
        // Notify other users
        this.io.to(roomId).emit('user-joined', user)

        // Handle questions
        socket.on('ask-question', async (data: { questionId: string; question: string }) => {
            try {
                await this._handleQuestion({
                    roomId,
                    questionId: data.questionId,
                    question: data.question,
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
                this._handleGiveUp(roomId, socket.id!)
            } catch (error) {
                console.error('Error handling give up:', error)
                socket.emit('error', { message: 'Failed to end round' })
            }
        })

        // Handle start new game
        socket.on('start-game', async () => {
            await this.startNewGame(roomId, socket)
        })

        // Handle user typing
        socket.on('typing', (input: string) => {
            this.gameSessions.updateUserTyping(roomId, socket.id!, input)
            this.io.to(roomId).emit('user-typing', { userId: socket.id, input })
        })

        // Handle disconnection
        socket.on('disconnect', () => {
            this._handleDisconnection(roomId, socket.id!)
        })
    }

    _handleDisconnection(roomId: string, userId: string): void {
        const session = this.gameSessions.getGameSession(roomId)
        if (session) {
            this.gameSessions.removeUserFromSession(roomId, userId)
        }
        this.io.to(roomId).emit('user-left', { userId })
        console.log('User disconnected:', userId, 'Total users:', this.io.engine.clientsCount)
    }

    async startNewGame(roomId: string, socket: GameSocket): Promise<GameSessionState | null> {
        try {
            const word = await this.ai.pickRandomWord()
            const category = await this.ai.categorizeWord(word)
            const gameSession = this.gameSessions.startNewGame(roomId, word, category)

            // Notify all players of new round
            this.io.to(roomId).emit('game-state-sync', {
                wordCategory: gameSession.wordCategory,
                questions: [],
                players: gameSession.players
            })

            console.log(
                `Game started in ${roomId}: ${gameSession.secretWord} (${gameSession.wordCategory})`
            )

            return this.getPublicSessionState(roomId)
        } catch (error) {
            console.error('Error starting game:', error)
            socket.emit('error', { message: 'Failed to start game' })
            return null
        }
    }

    async _handleQuestion(params: {
        roomId: string
        questionId: string
        question: string
        socket: GameSocket
    }): Promise<void> {
        const { roomId, questionId, question, socket } = params

        const session = this.gameSessions.getGameSession(roomId)
        if (!session) {
            await this.startNewGame(roomId, socket)
            throw new Error('No active game session')
        }

        this.gameSessions.addQuestionToSession(roomId, {
            id: questionId,
            question,
            userId: socket.id!
        })
        this.io.to(roomId).emit('question-updated', {
            id: questionId,
            question: question,
            userId: socket.id!
        })

        const aiResponse = await this.ai.answerQuestion(question, session.secretWord)

        this.gameSessions.updateQuestion(roomId, questionId, {
            answer: aiResponse.answer,
            isCorrectGuess: aiResponse.isCorrectGuess
        })

        this.io.to(roomId).emit('question-updated', {
            id: questionId,
            question: question,
            userId: socket.id!,
            ...aiResponse
        })

        if (aiResponse.isCorrectGuess) {
            // Game over!
            this.gameSessions.setGameOver(roomId, socket.id!)
            this.io
                .to(roomId)
                .emit('game-over', this.gameSessions.getGameSession(roomId)!.gameOver!)
        }
    }

    _handleGiveUp(roomId: string, userId: string): void {
        const session = this.gameSessions.getGameSession(roomId)
        if (!session) {
            throw new Error('No active game session')
        }

        // Set game over with null winnerId to indicate give up
        this.gameSessions.setGameOver(roomId, null)
        this.io.to(roomId).emit('game-over', this.gameSessions.getGameSession(roomId)!.gameOver!)
        console.log(
            `User ${userId} gave up in room ${roomId}. Secret word was: ${session.secretWord}`
        )
    }

    async getOrCreateGameSession(
        roomId: string,
        socket: GameSocket
    ): Promise<GameSessionState | null> {
        let currentSession = this.getPublicSessionState(roomId)
        if (!currentSession) {
            currentSession = await this.startNewGame(roomId, socket)
            if (!currentSession) {
                console.error(`Failed to create new game session for room ${roomId}`)
                return null
            }
        }
        return currentSession
    }

    getPublicSessionState(roomId: string): GameSessionState | null {
        const currentSession = this.gameSessions.getGameSession(roomId)
        if (!currentSession) {
            return null
        }

        return {
            wordCategory: currentSession.wordCategory,
            questions: currentSession.questions,
            gameOver: currentSession.gameOver,
            players: currentSession.players
        }
    }
}
