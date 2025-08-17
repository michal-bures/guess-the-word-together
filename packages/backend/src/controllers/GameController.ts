import type { Server, Socket } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents, GameSessionState } from 'shared'
import { WordGameAI } from '../services/WordGameAI'
import { GameSessionsManager } from '../services/GameSessionsManager'

export class GameController {
    constructor(
        private io: Server<ClientToServerEvents, ServerToClientEvents>,
        private gameSessions: GameSessionsManager,
        private ai: WordGameAI
    ) {}

    async handleConnection(
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
        roomId: string
    ): Promise<void> {
        console.log('User connected:', socket.id, 'Total users:', this.io.engine.clientsCount)

        // Join room
        socket.join(roomId)

        // Send current state or start new game
        const currentGameState = this.getCurrentGameState(roomId)
        if (currentGameState) {
            socket.emit('game-state-sync', currentGameState)
        } else {
            await this.startNewGame(roomId, socket)
        }

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

        // Handle disconnection
        socket.on('disconnect', () => {
            this._handleDisconnection(socket.id!)
        })
    }

    _handleDisconnection(socketId: string): void {
        console.log('User disconnected:', socketId, 'Total users:', this.io.engine.clientsCount)
    }

    async startNewGame(
        roomId: string,
        socket: Socket<ClientToServerEvents, ServerToClientEvents>
    ): Promise<void> {
        try {
            const word = await this.ai.pickRandomWord()
            const category = await this.ai.categorizeWord(word)
            const gameSession = this.gameSessions.startNewGame(roomId, word, category)

            // Notify all players of new round
            this.io.to(roomId).emit('game-state-sync', {
                wordCategory: gameSession.wordCategory,
                questions: []
            })

            console.log(
                `Game started in ${roomId}: ${gameSession.secretWord} (${gameSession.wordCategory})`
            )
        } catch (error) {
            console.error('Error starting game:', error)
            socket.emit('error', { message: 'Failed to start game' })
        }
    }

    async _handleQuestion(params: {
        roomId: string
        questionId: string
        question: string
        socket: Socket<ClientToServerEvents, ServerToClientEvents>
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

        const aiResponse = await this.ai.answerQuestion(question, session.secretWord)

        this.gameSessions.updateQuestion(roomId, questionId, {
            answer: aiResponse.answer,
            isCorrectGuess: aiResponse.isCorrectGuess
        })

        socket.emit('question-answered', {
            questionId,
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

    getCurrentGameState(roomId: string): GameSessionState | null {
        const currentSession = this.gameSessions.getGameSession(roomId)
        if (!currentSession) {
            return null
        }

        return {
            wordCategory: currentSession.wordCategory,
            questions: currentSession.questions,
            gameOver: currentSession.gameOver
        }
    }
}
