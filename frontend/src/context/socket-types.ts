// Events sent from server to client
export interface ServerToClientEvents {
  'status-message': (message: string) => void
  'round-started': (data: { round: number; category: string; message: string }) => void
  'question-answered': (data: { questionId: string; answer: string; isCorrectGuess: boolean }) => void
  'game-won': (data: { winner: string; word: string; message: string }) => void
  'test-response': (data: string) => void
  'game-state-sync': (data: { roundNumber: number; category: string; questions: any[] }) => void
}

// Events sent from client to server
export interface ClientToServerEvents {
  'ask-question': (data: { questionId: string; question: string }) => void
  'start-game': () => void
}
