import { createContext, useContext } from 'react'
import type { AppState } from './types'

export interface GameContextType {
    state: AppState
    sendQuestion: () => void
    startNewRound: () => void
    giveUp: () => void
    updateQuestionInput: (input: string) => void
}

export const AppContext = createContext<GameContextType | undefined>(undefined)

export function useAppContext() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useAppState must be used within a GameProvider')
    }
    return context
}
