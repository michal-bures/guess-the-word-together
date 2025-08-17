import { ClientToServerEvents, GameSessionState, ServerToClientEvents } from 'shared'
import { Socket } from 'socket.io'

export interface BackendGameSessionState extends GameSessionState {
    secretWord: string
}

export type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>
