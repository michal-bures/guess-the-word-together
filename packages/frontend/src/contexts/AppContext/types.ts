import type { Socket } from 'socket.io-client'
import type { ClientToServerEvents, GameSessionState, ServerToClientEvents } from 'shared'

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export interface ConnectedUser {
    id: string
    name: string
    typing: string
    lastTyped: Date
}

export interface AppState {
    socket: TypedSocket | null
    connected: boolean
    currentUserId: string

    questionInput: string
    gameState: GameSessionState
}
