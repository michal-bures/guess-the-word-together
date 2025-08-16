import { QuestionAnswerPair } from 'shared'
import { BackendGameSessionState } from '../types'

export class GameDirector {
    private sessions: Map<string, BackendGameSessionState> = new Map()

    startNewGame(roomId: string, secretWord: string, category: string): BackendGameSessionState {
        console.log(
            'Starting new game in room:',
            roomId,
            'with secret word:',
            secretWord,
            'and category:',
            category
        )
        const newSession: BackendGameSessionState = {
            secretWord: secretWord,
            wordCategory: category,
            questions: []
        }
        this.sessions.set(roomId, newSession)
        return newSession
    }

    getGameSession(roomId: string): BackendGameSessionState | undefined {
        return this.sessions.get(roomId)
    }

    addQuestionToSession(roomId: string, questionData: QuestionAnswerPair): void {
        const session = this.sessions.get(roomId)
        if (session) {
            session.questions.push(questionData)
        }
    }

    updateQuestion(
        roomId: string,
        questionId: string,
        questionData: Partial<QuestionAnswerPair>
    ): void {
        const session = this.sessions.get(roomId)
        const question = session?.questions.find(q => q.id === questionId)
        if (question) {
            Object.assign(question, questionData)
        } else {
            console.warn(`Question with ID ${questionId} not found in session ${roomId}`)
        }
    }

    setGameOver(roomId: string, winnerId: string): void {
        const session = this.sessions.get(roomId)
        if (session) {
            session.gameOver = {
                winnerId,
                secretWord: session.secretWord
            }
        }
    }

    endGame(roomId: string): void {
        this.sessions.delete(roomId)
    }

    hasActiveSession(roomId: string): boolean {
        return this.sessions.has(roomId)
    }
}

export const gameDirector = new GameDirector()
