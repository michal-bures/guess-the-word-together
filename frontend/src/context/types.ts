import type {Socket} from "socket.io-client";
import type {ClientToServerEvents, ServerToClientEvents} from "./socket-types.ts";

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface ChatMessage {
    id: string
    text: string
    sender: 'user' | 'ai'
    userId?: string
    timestamp: Date
}

export interface QuestionAnswerPair {
    id: string
    question: string
    answer?: string
    userId: string
    timestamp: Date
    isCorrectGuess?: boolean
}

export interface ConnectedUser {
    id: string
    name: string
    typing: string
    lastTyped: Date
}

export interface GameState {
    socket: TypedSocket | null
    connected: boolean
    currentUserId: string
    questionAnswerPairs: QuestionAnswerPair[]
    connectedUsers: ConnectedUser[]
    question: string
    gamePhase: 'waiting' | 'playing' | 'won'
    currentRound: number
    questionsAsked: number
    currentCategory?: string
    lastWinner?: string
    statusMessage: string
}

