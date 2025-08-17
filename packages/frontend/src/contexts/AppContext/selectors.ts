import type { AppState } from './types'
import type { UserInfo } from 'shared'

export function getCurrentPlayer(state: AppState): UserInfo | null {
    return state.gameState.players[state.currentUserId] || null
}
