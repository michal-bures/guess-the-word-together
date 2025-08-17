export interface GameSessionState {
    wordCategory: string
    questions: QuestionAnswerPair[]
    gameOver?: GameOverInfo //when present, indicates the game has ended
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
