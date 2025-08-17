import { QuestionAnswerPair, UserInfo } from 'shared'
import { BackendGameSessionState } from '../types'
import { generateNickname, getNextColor } from '../utils/playerColors'

export class GameSessionsManager {
    private sessions: Map<string, BackendGameSessionState> = new Map()

    startNewGame(roomId: string, secretWord: string, category: string): BackendGameSessionState {
        console.log(
            `Starting new game in room ${roomId} with secret word ${secretWord} (category: ${category})`
        )
        const players = this.sessions.get(roomId)?.players || {}

        const newSession: BackendGameSessionState = {
            secretWord: secretWord,
            wordCategory: category,
            questions: [],
            players: players
        }
        this.sessions.set(roomId, newSession)
        return newSession
    }

    addUserToSession(roomId: string, userId: string) {
        const session = this.sessions.get(roomId)
        if (session) {
            if (!session.players[userId]) {
                const takenColors = Object.values(session.players).map(player => player.color)
                const color = getNextColor(takenColors)
                const nickname = generateNickname(color)
                const newUser: UserInfo = {
                    id: userId,
                    name: nickname,
                    color: color,
                    currentInput: '',
                    lastTyped: Date.now()
                }
                session.players[userId] = newUser
                return newUser
            } else {
                console.warn(`User ${userId} already exists in session ${roomId}`)
            }
        } else {
            console.error(`No active session found for room ${roomId}`)
        }
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

    setGameOver(roomId: string, winnerId: string | null): void {
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

    removeUserFromSession(roomId: string, userId: string) {
        const session = this.sessions.get(roomId)
        if (session) {
            delete session.players[userId]
        } else {
            console.warn(`No active session found for room ${roomId} to remove user ${userId}`)
        }
    }

    updateUserTyping(roomId: string, s: string, input: string) {
        const session = this.sessions.get(roomId)
        if (session) {
            const user = session.players[s]
            if (user) {
                user.currentInput = input
                user.lastTyped = Date.now()
            } else {
                console.warn(`User ${s} not found in session ${roomId}`)
            }
        } else {
            console.warn(`No active session found for room ${roomId} to update typing state`)
        }
    }
}
