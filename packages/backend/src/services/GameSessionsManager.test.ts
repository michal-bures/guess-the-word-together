import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GameSessionsManager } from './GameSessionsManager'
import type { QuestionAnswerPair } from 'shared'

describe('GameDirector', () => {
    let gameSessionsManager: GameSessionsManager

    beforeEach(() => {
        gameSessionsManager = new GameSessionsManager()
        vi.clearAllMocks()
    })

    describe('startNewGame', () => {
        it('creates a new game session with correct data', () => {
            const session = gameSessionsManager.startNewGame('room1', 'elephant', 'animals')

            expect(session).toEqual({
                secretWord: 'elephant',
                wordCategory: 'animals',
                questions: []
            })
        })

        it('stores the session internally', () => {
            gameSessionsManager.startNewGame('room1', 'cat', 'animals')

            expect(gameSessionsManager.hasActiveSession('room1')).toBe(true)
            expect(gameSessionsManager.getGameSession('room1')).toEqual({
                secretWord: 'cat',
                wordCategory: 'animals',
                questions: []
            })
        })

        it('overwrites existing session for the same room', () => {
            gameSessionsManager.startNewGame('room1', 'dog', 'animals')
            gameSessionsManager.startNewGame('room1', 'car', 'vehicles')

            const session = gameSessionsManager.getGameSession('room1')
            expect(session?.secretWord).toBe('car')
            expect(session?.wordCategory).toBe('vehicles')
        })
    })

    describe('getGameSession', () => {
        it('returns session when it exists', () => {
            gameSessionsManager.startNewGame('room1', 'test', 'category')

            const session = gameSessionsManager.getGameSession('room1')

            expect(session).toBeDefined()
            expect(session?.secretWord).toBe('test')
        })

        it('returns undefined when session does not exist', () => {
            const session = gameSessionsManager.getGameSession('nonexistent-room')

            expect(session).toBeUndefined()
        })
    })

    describe('addQuestionToSession', () => {
        it('adds question to existing session', () => {
            gameSessionsManager.startNewGame('room1', 'elephant', 'animals')

            const question: QuestionAnswerPair = {
                id: 'q1',
                question: 'Is it big?',
                userId: 'user1'
            }

            gameSessionsManager.addQuestionToSession('room1', question)

            const session = gameSessionsManager.getGameSession('room1')
            expect(session?.questions).toHaveLength(1)
            expect(session?.questions[0]).toEqual(question)
        })

        it('handles multiple questions in order', () => {
            gameSessionsManager.startNewGame('room1', 'elephant', 'animals')

            const question1: QuestionAnswerPair = {
                id: 'q1',
                question: 'Is it big?',
                userId: 'user1'
            }
            const question2: QuestionAnswerPair = {
                id: 'q2',
                question: 'Does it have fur?',
                userId: 'user2'
            }

            gameSessionsManager.addQuestionToSession('room1', question1)
            gameSessionsManager.addQuestionToSession('room1', question2)

            const session = gameSessionsManager.getGameSession('room1')
            expect(session?.questions).toHaveLength(2)
            expect(session?.questions[0]).toEqual(question1)
            expect(session?.questions[1]).toEqual(question2)
        })

        it('does nothing when session does not exist', () => {
            const question: QuestionAnswerPair = {
                id: 'q1',
                question: 'Is it big?',
                userId: 'user1'
            }

            // Should not throw error
            gameSessionsManager.addQuestionToSession('nonexistent-room', question)

            expect(gameSessionsManager.getGameSession('nonexistent-room')).toBeUndefined()
        })
    })

    describe('updateQuestion', () => {
        it('updates existing question with new data', () => {
            const roomId = 'room1'
            gameSessionsManager.startNewGame(roomId, 'elephant', 'animals')

            const question: QuestionAnswerPair = {
                id: 'q1',
                question: 'Is it big?',
                userId: 'user1'
            }
            gameSessionsManager.addQuestionToSession(roomId, question)

            gameSessionsManager.updateQuestion(roomId, 'q1', {
                answer: 'Yes',
                isCorrectGuess: false
            })

            const session = gameSessionsManager.getGameSession(roomId)
            const updatedQuestion = session?.questions[0]
            expect(updatedQuestion).toEqual({
                id: 'q1',
                question: 'Is it big?',
                userId: 'user1',
                answer: 'Yes',
                isCorrectGuess: false
            })
        })

        it('updates only specified fields', () => {
            const roomId = 'room1'
            gameSessionsManager.startNewGame(roomId, 'elephant', 'animals')

            const question: QuestionAnswerPair = {
                id: 'q1',
                question: 'Is it big?',
                userId: 'user1',
                answer: 'Maybe'
            }
            gameSessionsManager.addQuestionToSession(roomId, question)

            gameSessionsManager.updateQuestion(roomId, 'q1', {
                isCorrectGuess: true
            })

            const session = gameSessionsManager.getGameSession(roomId)
            const updatedQuestion = session?.questions[0]
            expect(updatedQuestion?.answer).toBe('Maybe') // Unchanged
            expect(updatedQuestion?.isCorrectGuess).toBe(true) // Updated
        })

        it('logs warning when question not found', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
            gameSessionsManager.startNewGame('room1', 'elephant', 'animals')

            gameSessionsManager.updateQuestion('room1', 'nonexistent-q', { answer: 'Yes' })

            expect(consoleSpy).toHaveBeenCalledWith(
                'Question with ID nonexistent-q not found in session room1'
            )
            consoleSpy.mockRestore()
        })

        it('logs warning when session does not exist', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

            gameSessionsManager.updateQuestion('nonexistent-room', 'q1', { answer: 'Yes' })

            expect(consoleSpy).toHaveBeenCalledWith(
                'Question with ID q1 not found in session nonexistent-room'
            )
            consoleSpy.mockRestore()
        })
    })

    describe('setGameOver', () => {
        it('sets game over state with winner and secret word', () => {
            gameSessionsManager.startNewGame('room1', 'elephant', 'animals')

            gameSessionsManager.setGameOver('room1', 'user123')

            const session = gameSessionsManager.getGameSession('room1')
            expect(session?.gameOver).toEqual({
                winnerId: 'user123',
                secretWord: 'elephant'
            })
        })

        it('does nothing when session does not exist', () => {
            // Should not throw error
            gameSessionsManager.setGameOver('nonexistent-room', 'user123')

            expect(gameSessionsManager.getGameSession('nonexistent-room')).toBeUndefined()
        })
    })

    describe('endGame', () => {
        it('removes session from memory', () => {
            gameSessionsManager.startNewGame('room1', 'elephant', 'animals')

            expect(gameSessionsManager.hasActiveSession('room1')).toBe(true)

            gameSessionsManager.endGame('room1')

            expect(gameSessionsManager.hasActiveSession('room1')).toBe(false)
            expect(gameSessionsManager.getGameSession('room1')).toBeUndefined()
        })

        it('does nothing when session does not exist', () => {
            // Should not throw error
            gameSessionsManager.endGame('nonexistent-room')

            expect(gameSessionsManager.hasActiveSession('nonexistent-room')).toBe(false)
        })
    })

    describe('hasActiveSession', () => {
        it('returns true when session exists', () => {
            gameSessionsManager.startNewGame('room1', 'elephant', 'animals')

            expect(gameSessionsManager.hasActiveSession('room1')).toBe(true)
        })

        it('returns false when session does not exist', () => {
            expect(gameSessionsManager.hasActiveSession('nonexistent-room')).toBe(false)
        })

        it('returns false after session is ended', () => {
            gameSessionsManager.startNewGame('room1', 'elephant', 'animals')
            gameSessionsManager.endGame('room1')

            expect(gameSessionsManager.hasActiveSession('room1')).toBe(false)
        })
    })

    describe('multiple rooms', () => {
        it('manages multiple independent sessions', () => {
            gameSessionsManager.startNewGame('room1', 'elephant', 'animals')
            gameSessionsManager.startNewGame('room2', 'car', 'vehicles')

            const session1 = gameSessionsManager.getGameSession('room1')
            const session2 = gameSessionsManager.getGameSession('room2')

            expect(session1?.secretWord).toBe('elephant')
            expect(session2?.secretWord).toBe('car')
        })

        it('operations on one room do not affect others', () => {
            gameSessionsManager.startNewGame('room1', 'elephant', 'animals')
            gameSessionsManager.startNewGame('room2', 'car', 'vehicles')

            gameSessionsManager.endGame('room1')

            expect(gameSessionsManager.hasActiveSession('room1')).toBe(false)
            expect(gameSessionsManager.hasActiveSession('room2')).toBe(true)
        })
    })
})
