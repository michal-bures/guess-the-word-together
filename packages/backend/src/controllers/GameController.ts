import type { Server, Socket } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents, GameSessionState } from 'shared'
import { wordGameAI } from '../services/WordGameAI'
import { gameSessionsManager } from '../services/GameSessionsManager'

export class GameController {
    constructor(private io: Server<ClientToServerEvents, ServerToClientEvents>) {}

    async startNewGame(
        roomId: string,
        socket: Socket<ClientToServerEvents, ServerToClientEvents>
    ): Promise<void> {
        try {
            const word = await wordGameAI.pickRandomWord()
            const category = await wordGameAI.categorizeWord(word)
            const gameSession = gameSessionsManager.startNewGame(roomId, word, category)

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

    async handleQuestion(params: {
        roomId: string
        questionId: string
        question: string
        userId: string
        socket: Socket<ClientToServerEvents, ServerToClientEvents>
    }): Promise<void> {
        const { roomId, questionId, question, userId, socket } = params
        
        const session = gameSessionsManager.getGameSession(roomId)
        if (!session) {
            await this.startNewGame(roomId, socket)
            throw new Error('No active game session')
        }

        gameSessionsManager.addQuestionToSession(roomId, {
            id: questionId,
            question,
            userId
        })

        const aiResponse = await wordGameAI.answerQuestion(question, session.secretWord)

        gameSessionsManager.updateQuestion(roomId, questionId, {
            answer: aiResponse.answer,
            isCorrectGuess: aiResponse.isCorrectGuess
        })

        socket.emit('question-answered', {
            questionId,
            ...aiResponse
        })

        if (aiResponse.isCorrectGuess) {
            // Game over!
            gameSessionsManager.setGameOver(roomId, userId)
            this.io
                .to(roomId)
                .emit('game-over', gameSessionsManager.getGameSession(roomId)!.gameOver!)
        }
    }

    handleGiveUp(roomId: string, userId: string): void {
        const session = gameSessionsManager.getGameSession(roomId)
        if (!session) {
            throw new Error('No active game session')
        }

        // Set game over with null winnerId to indicate give up
        gameSessionsManager.setGameOver(roomId, null)
        this.io.to(roomId).emit('game-over', gameSessionsManager.getGameSession(roomId)!.gameOver!)
        console.log(
            `User ${userId} gave up in room ${roomId}. Secret word was: ${session.secretWord}`
        )
    }

    getCurrentGameState(roomId: string): GameSessionState | null {
        const currentSession = gameSessionsManager.getGameSession(roomId)
        if (!currentSession) {
            return null
        }

        return {
            wordCategory: currentSession.wordCategory,
            questions: currentSession.questions,
            gameOver: currentSession.gameOver
        }
    }

    joinRoom(socket: Socket<ClientToServerEvents, ServerToClientEvents>, roomId: string): void {
        socket.join(roomId)
    }
}
