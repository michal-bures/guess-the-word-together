// Socket.IO event types
import {GameSessionState} from "./gameSessionState";

export interface ServerToClientEvents {
  'status-message': (message: string) => void
  'round-started': (data: { round: number; category: string; message: string }) => void
  'question-answered': (data: { questionId: string; answer: string; isCorrectGuess: boolean }) => void
  'game-won': (data: { winner: string; word: string; message: string }) => void
  'test-response': (data: string) => void
  'game-state-sync': (data: GameSessionState) => void
  'error': (data: { message: string }) => void
}

export interface ClientToServerEvents {
  'ask-question': (data: { questionId: string; question: string }) => void
  'start-game': () => void
}
