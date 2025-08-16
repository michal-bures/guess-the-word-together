import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GameDirector } from './GameDirector'
import type { QuestionAnswerPair } from 'shared'

describe('GameDirector', () => {
    let gameDirector: GameDirector

    beforeEach(() => {
        gameDirector = new GameDirector()
        vi.clearAllMocks()
    })

    describe('startNewGame', () => {
        it('creates a new game session with correct data', () => {
            const session = gameDirector.startNewGame('room1', 'elephant', 'animals')

            expect(session).toEqual({
                secretWord: 'elephant',
                wordCategory: 'animals',
                questions: []
            })
        })

        it('stores the session internally', () => {
            gameDirector.startNewGame('room1', 'cat', 'animals')

            expect(gameDirector.hasActiveSession('room1')).toBe(true)
            expect(gameDirector.getGameSession('room1')).toEqual({
                secretWord: 'cat',
                wordCategory: 'animals',
                questions: []
            })
        })

        it('overwrites existing session for the same room', () => {
            gameDirector.startNewGame('room1', 'dog', 'animals')
            gameDirector.startNewGame('room1', 'car', 'vehicles')

            const session = gameDirector.getGameSession('room1')
            expect(session?.secretWord).toBe('car')
            expect(session?.wordCategory).toBe('vehicles')
        })
    })

    describe('getGameSession', () => {
        it('returns session when it exists', () => {
            gameDirector.startNewGame('room1', 'test', 'category')

            const session = gameDirector.getGameSession('room1')

            expect(session).toBeDefined()
            expect(session?.secretWord).toBe('test')
        })

        it('returns undefined when session does not exist', () => {
            const session = gameDirector.getGameSession('nonexistent-room')

            expect(session).toBeUndefined()
        })
    })

    describe('addQuestionToSession', () => {
        it('adds question to existing session', () => {
            gameDirector.startNewGame('room1', 'elephant', 'animals')

            const question: QuestionAnswerPair = {
                id: 'q1',
                question: 'Is it big?',
                userId: 'user1'
            }

            gameDirector.addQuestionToSession('room1', question)

            const session = gameDirector.getGameSession('room1')
            expect(session?.questions).toHaveLength(1)
            expect(session?.questions[0]).toEqual(question)
        })

        it('handles multiple questions in order', () => {
            gameDirector.startNewGame('room1', 'elephant', 'animals')

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

            gameDirector.addQuestionToSession('room1', question1)
            gameDirector.addQuestionToSession('room1', question2)

            const session = gameDirector.getGameSession('room1')
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
            gameDirector.addQuestionToSession('nonexistent-room', question)

            expect(gameDirector.getGameSession('nonexistent-room')).toBeUndefined()
        })
    })

    describe('updateQuestion', () => {
        it('updates existing question with new data', () => {
            const roomId = 'room1'
            gameDirector.startNewGame(roomId, 'elephant', 'animals')

            const question: QuestionAnswerPair = {
                id: 'q1',
                question: 'Is it big?',
                userId: 'user1'
            }
            gameDirector.addQuestionToSession(roomId, question)

            gameDirector.updateQuestion(roomId, 'q1', {
                answer: 'Yes',
                isCorrectGuess: false
            })

            const session = gameDirector.getGameSession(roomId)
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
            gameDirector.startNewGame(roomId, 'elephant', 'animals')

            const question: QuestionAnswerPair = {
                id: 'q1',
                question: 'Is it big?',
                userId: 'user1',
                answer: 'Maybe'
            }
            gameDirector.addQuestionToSession(roomId, question)

            gameDirector.updateQuestion(roomId, 'q1', {
                isCorrectGuess: true
            })

            const session = gameDirector.getGameSession(roomId)
            const updatedQuestion = session?.questions[0]
            expect(updatedQuestion?.answer).toBe('Maybe') // Unchanged
            expect(updatedQuestion?.isCorrectGuess).toBe(true) // Updated
        })

        it('logs warning when question not found', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
            gameDirector.startNewGame('room1', 'elephant', 'animals')

            gameDirector.updateQuestion('room1', 'nonexistent-q', { answer: 'Yes' })

            expect(consoleSpy).toHaveBeenCalledWith(
                'Question with ID nonexistent-q not found in session room1'
            )
            consoleSpy.mockRestore()
        })

        it('logs warning when session does not exist', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

            gameDirector.updateQuestion('nonexistent-room', 'q1', { answer: 'Yes' })

            expect(consoleSpy).toHaveBeenCalledWith(
                'Question with ID q1 not found in session nonexistent-room'
            )
            consoleSpy.mockRestore()
        })
    })

    describe('setGameOver', () => {
        it('sets game over state with winner and secret word', () => {
            gameDirector.startNewGame('room1', 'elephant', 'animals')

            gameDirector.setGameOver('room1', 'user123')

            const session = gameDirector.getGameSession('room1')
            expect(session?.gameOver).toEqual({
                winnerId: 'user123',
                secretWord: 'elephant'
            })
        })

        it('does nothing when session does not exist', () => {
            // Should not throw error
            gameDirector.setGameOver('nonexistent-room', 'user123')

            expect(gameDirector.getGameSession('nonexistent-room')).toBeUndefined()
        })
    })

    describe('endGame', () => {
        it('removes session from memory', () => {
            gameDirector.startNewGame('room1', 'elephant', 'animals')

            expect(gameDirector.hasActiveSession('room1')).toBe(true)

            gameDirector.endGame('room1')

            expect(gameDirector.hasActiveSession('room1')).toBe(false)
            expect(gameDirector.getGameSession('room1')).toBeUndefined()
        })

        it('does nothing when session does not exist', () => {
            // Should not throw error
            gameDirector.endGame('nonexistent-room')

            expect(gameDirector.hasActiveSession('nonexistent-room')).toBe(false)
        })
    })

    describe('hasActiveSession', () => {
        it('returns true when session exists', () => {
            gameDirector.startNewGame('room1', 'elephant', 'animals')

            expect(gameDirector.hasActiveSession('room1')).toBe(true)
        })

        it('returns false when session does not exist', () => {
            expect(gameDirector.hasActiveSession('nonexistent-room')).toBe(false)
        })

        it('returns false after session is ended', () => {
            gameDirector.startNewGame('room1', 'elephant', 'animals')
            gameDirector.endGame('room1')

            expect(gameDirector.hasActiveSession('room1')).toBe(false)
        })
    })

    describe('multiple rooms', () => {
        it('manages multiple independent sessions', () => {
            gameDirector.startNewGame('room1', 'elephant', 'animals')
            gameDirector.startNewGame('room2', 'car', 'vehicles')

            const session1 = gameDirector.getGameSession('room1')
            const session2 = gameDirector.getGameSession('room2')

            expect(session1?.secretWord).toBe('elephant')
            expect(session2?.secretWord).toBe('car')
        })

        it('operations on one room do not affect others', () => {
            gameDirector.startNewGame('room1', 'elephant', 'animals')
            gameDirector.startNewGame('room2', 'car', 'vehicles')

            gameDirector.endGame('room1')

            expect(gameDirector.hasActiveSession('room1')).toBe(false)
            expect(gameDirector.hasActiveSession('room2')).toBe(true)
        })
    })
})
