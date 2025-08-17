export interface GameSessionState {
    wordCategory: string
    questions: QuestionAnswerPair[]
    players: Record<string, UserInfo>
    gameOver?: GameOverInfo //when present, indicates the game has ended
}

export interface UserInfo {
    id: string
    name: string
    color: string
    currentInput: string
    lastTyped: number
}

export interface GameOverInfo {
    winnerId: string | null // null = gave up, string = won
    secretWord: string
}

export interface QuestionAnswerPair {
    id: string
    question: string
    answer?: string
    userId: string
    isCorrectGuess?: boolean
    isError?: boolean
}

export interface Answer {
    questionId: string
    answer: string
    isError?: boolean
    isCorrectGuess: boolean
}
