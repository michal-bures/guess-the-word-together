import { type ReactNode, useEffect, useReducer, useRef } from 'react'
import { Actions } from './actions'
import type { AppState, TypedSocket } from './types'
import { reducer } from './reducer'
import { io } from 'socket.io-client'
import { AppContext } from './AppContext'
import { useToast } from '../../hooks/useToast'
import ErrorToast from '../../components/ErrorToast'

const initialState: AppState = {
    socket: null,
    connected: false,
    currentUserId: '',
    questionInput: '',
    gameState: {
        wordCategory: '',
        questions: []
    },
    connectedUsers: []
}

export function GameProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const { toasts, showError, removeToast } = useToast()

    // Create a ref to store the current state for debugging
    const stateRef = useRef(state)
    stateRef.current = state

    // Expose game state to global scope for debugging (only setup once)
    useEffect(() => {
        window.getAppState = () => {
            console.log('AppState:', stateRef.current)
        }

        // Also provide direct access to current state
        Object.defineProperty(window, 'GameSessionState', {
            get: () => stateRef.current,
            configurable: true
        })
    }, []) // Empty dependency array - only runs once

    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin
        const newSocket: TypedSocket = io(backendUrl)
        dispatch(Actions.setSocket(newSocket))

        newSocket.on('connect', () => {
            dispatch(
                Actions.setConnectionState({
                    connected: true,
                    userId: newSocket.id!
                })
            )
            console.log('Connected to server')
        })

        newSocket.on('disconnect', reason => {
            dispatch(Actions.setConnectionState({ connected: false, userId: '' }))
            console.log('Disconnected from server:', reason)
            if (reason === 'transport error' || reason === 'ping timeout') {
                showError('Connection lost. Trying to reconnect...')
            }
        })

        // Handle question answers
        newSocket.on(
            'question-answered',
            (data: {
                questionId: string
                answer: string
                isCorrectGuess: boolean
                isError?: boolean
            }) => {
                if (data.isError) {
                    showError('Error processing your question. Please try again later.')
                }
                dispatch(
                    Actions.addAnswer({
                        questionId: data.questionId,
                        answer: data.answer,
                        isCorrectGuess: data.isCorrectGuess
                    })
                )
            }
        )

        // Handle game won
        newSocket.on('game-over', data => {
            dispatch(Actions.setGameOver(data))
        })

        newSocket.on('game-state-sync', data => {
            dispatch(Actions.syncGameSessionState(data))
        })

        return () => {
            newSocket.close()
        }
    }, [showError])

    const sendQuestion = () => {
        if (state.socket && state.questionInput.trim()) {
            const sanitizedQuestion = sanitizeQuestion(state.questionInput)
            const questionId = crypto.randomUUID()
            dispatch(
                Actions.addQuestion({
                    id: questionId,
                    question: sanitizedQuestion,
                    userId: state.currentUserId
                })
            )
            state.socket.emit('ask-question', {
                questionId: questionId,
                question: sanitizedQuestion
            })
            dispatch(Actions.setQuestionInput(''))
        }
    }

    const startNewRound = () => {
        if (state.socket) {
            state.socket.emit('start-game')
        }
    }

    const giveUp = () => {
        if (state.socket) {
            state.socket.emit('give-up')
        }
    }

    const updateQuestionInput = (input: string) => {
        dispatch(Actions.setQuestionInput(input))
    }

    return (
        <AppContext.Provider
            value={{ state, sendQuestion, startNewRound, giveUp, updateQuestionInput }}
        >
            {children}
            {toasts.map(toast => (
                <ErrorToast
                    key={toast.id}
                    message={toast.message}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </AppContext.Provider>
    )
}

function sanitizeQuestion(question: string) {
    question = question.trim()
    if (!question.includes(' ')) {
        //single word
        question = `Is it ${question}`
    }
    if (!question.endsWith('?')) {
        question += '?'
    }

    return question
}
