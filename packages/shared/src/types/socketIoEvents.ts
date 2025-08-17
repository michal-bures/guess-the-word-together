// Socket.IO event types
import type {
    GameOverInfo,
    GameSessionState,
    QuestionAnswerPair,
    UserInfo
} from './gameSessionState'

export interface ServerToClientEvents {
    'question-updated': (data: QuestionAnswerPair) => void
    'game-over': (data: GameOverInfo) => void
    'game-state-sync': (data: GameSessionState) => void
    error: (data: { message: string }) => void

    'user-joined': (data: UserInfo) => void
    'user-left': (data: { userId: string }) => void
    'user-typing': (data: { userId: string; input: string }) => void
}

export interface ClientToServerEvents {
    'ask-question': (data: { questionId: string; question: string }) => void
    typing: (data: string) => void
    'start-game': () => void
    'give-up': () => void
}
