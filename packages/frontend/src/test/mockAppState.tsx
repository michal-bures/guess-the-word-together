import { vi } from 'vitest'
import type { AppState, TypedSocket } from '../contexts/AppContext/types'

export function mockAppState(overrides: Partial<AppState> = {}): AppState {
    return {
        socket: mockSocket(),
        connected: true,
        currentUserId: 'user1',
        questionInput: '',
        gameState: {
            wordCategory: 'animals',
            gameOver: undefined,
            questions: [],
            players: {}
        },
        ...overrides
    }
}

export function mockSocket(overrides: Partial<TypedSocket> = {}): TypedSocket {
    return {
        connected: true,
        id: 'socket1',
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        ...overrides
    } as unknown as TypedSocket
}
