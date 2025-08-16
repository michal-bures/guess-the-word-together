export interface GameSessionState {
    category: string
    roundNumber: number
    questions: QuestionAnswerPair[]
}

export interface QuestionAnswerPair {
    id: string
    question: string
    answer?: string
    userId: string
    timestamp: Date
    isCorrectGuess?: boolean
}

