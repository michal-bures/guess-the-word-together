import type { AppState } from '../contexts/AppContext/types'
import { AppContext, type GameContextType } from '../contexts/AppContext/AppContext'
import { mockAppState } from './mockAppState'
import { render } from '@testing-library/react'
import { vi } from 'vitest'

export function renderWithMockAppState(
    component: React.ReactElement,
    state: AppState = mockAppState(),
    mockFunctions: Partial<
        Pick<GameContextType, 'startNewRound' | 'sendQuestion' | 'updateQuestionInput'>
    > = {}
) {
    const fullState = mockAppState(state)
    const mockStartNewRound = vi.fn()
    const mockSendQuestion = vi.fn()
    const mockUpdateQuestionInput = vi.fn()

    const contextValue: GameContextType = {
        state: fullState,
        startNewRound: mockFunctions.startNewRound || mockStartNewRound,
        sendQuestion: mockFunctions.sendQuestion || mockSendQuestion,
        updateQuestionInput: mockFunctions.updateQuestionInput || mockUpdateQuestionInput
    }

    const result = render(
        <AppContext.Provider value={contextValue}>{component}</AppContext.Provider>
    )

    return {
        ...result,
        mockStartNewRound: mockFunctions.startNewRound || mockStartNewRound,
        mockSendQuestion: mockFunctions.sendQuestion || mockSendQuestion,
        mockUpdateQuestionInput: mockFunctions.updateQuestionInput || mockUpdateQuestionInput
    }
}
