// Socket.IO event types
import {GameOverInfo, GameSessionState} from "./gameSessionState";

export interface ServerToClientEvents {
    'question-answered': (data: Answer) => void
    'game-over': (data: GameOverInfo) => void
    'game-state-sync': (data: GameSessionState) => void
    'error': (data: { message: string }) => void
}

export interface ClientToServerEvents {
    'ask-question': (data: { questionId: string; question: string }) => void
    'start-game': () => void
    'give-up': () => void
}

export interface Answer {
    questionId: string;
    answer: string;
    isError?: boolean;
    isCorrectGuess: boolean
}
