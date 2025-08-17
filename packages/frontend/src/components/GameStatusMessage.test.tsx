import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameStatusMessage } from './GameStatusMessage'
import { mockAppState, mockSocket } from '../test/mockAppState'
import { renderWithMockAppState } from '../test/renderWithMockAppState'

// Mock socket.io to prevent actual connections
vi.mock('socket.io-client', () => ({
    io: vi.fn(() => ({
        on: vi.fn(),
        emit: vi.fn(),
        close: vi.fn()
    }))
}))

describe('GameStatusMessage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows reconnecting message when socket is disconnected', () => {
        const state = mockAppState({
            socket: mockSocket({ connected: false })
        })

        renderWithMockAppState(<GameStatusMessage />, state)

        expect(screen.getByText('Reconnecting...')).toBeInTheDocument()
        expect(screen.getByText('Trying to restore connection to the server.')).toBeInTheDocument()
        expect(screen.queryByText('Play Again')).not.toBeInTheDocument()
    })

    it('shows game over message with secret word when game is won', () => {
        const state = mockAppState({
            gameState: {
                wordCategory: 'animals',
                gameOver: {
                    secretWord: 'elephant',
                    winnerId: 'player1'
                },
                questions: []
            }
        })

        renderWithMockAppState(<GameStatusMessage />, state)

        expect(screen.getByText('🎉 You guessed it!')).toBeInTheDocument()
        expect(screen.getByText('The secret word was "elephant".')).toBeInTheDocument()
        expect(screen.getByText('Play Again')).toBeInTheDocument()
    })

    it('shows playing message with word category when game is active', () => {
        const state = mockAppState({
            gameState: {
                wordCategory: 'vehicles',
                gameOver: undefined,
                questions: []
            }
        })

        renderWithMockAppState(<GameStatusMessage />, state)

        expect(screen.getByText("I'm thinking about some vehicles...")).toBeInTheDocument()
        expect(screen.getByText('Can you guess the secret word?')).toBeInTheDocument()
        expect(screen.queryByText('Play Again')).not.toBeInTheDocument()
    })

    it('calls startNewRound when Play Again button is clicked', () => {
        const mockStartNewRound = vi.fn()
        const state = mockAppState({
            gameState: {
                wordCategory: 'animals',
                gameOver: {
                    secretWord: 'cat',
                    winnerId: 'player1'
                },
                questions: []
            }
        })

        renderWithMockAppState(<GameStatusMessage />, state, { startNewRound: mockStartNewRound })

        const playAgainButton = screen.getByText('Play Again')
        fireEvent.click(playAgainButton)

        expect(mockStartNewRound).toHaveBeenCalledOnce()
    })

    it('handles null socket gracefully', () => {
        const state = mockAppState({
            socket: null
        })

        renderWithMockAppState(<GameStatusMessage />, state)

        expect(screen.getByText('Reconnecting...')).toBeInTheDocument()
    })
})
