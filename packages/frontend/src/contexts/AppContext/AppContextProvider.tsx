import { type ReactNode, useEffect, useReducer, useRef } from 'react'
import { Actions } from './actions'
import type { AppState, TypedSocket } from './types'
import { reducer } from './reducer'
import { io } from 'socket.io-client'
import { AppContext } from './AppContext'
import { useToast } from '../../hooks/useToast'
import { useDebounce } from '../../hooks/useDebounce'
import ErrorToast from '../../components/ErrorToast'
import type { QuestionAnswerPair } from 'shared'

const initialState: AppState = {
    socket: null,
    connected: false,
    currentUserId: '',
    questionInput: '',
    gameState: {
        wordCategory: '',
        questions: [],
        players: {}
    }
}

export function AppContextProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const { toasts, showError, removeToast } = useToast()

    // Debounced typing emit - fires at most once per second
    const debouncedTypingEmit = useDebounce((input: string) => {
        state.socket?.emit('typing', input.trim())
    }, 250)

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
        })

        // Handle new questions
        newSocket.on('question-updated', (data: QuestionAnswerPair) => {
            dispatch(Actions.addQuestion(data))
            if (!data.answer) {
                //user just asked a question => clear their input
                dispatch(Actions.setUserTyping({ userId: data.userId, input: '' }))
            }
        })

        // Handle user typing
        newSocket.on('user-typing', data => {
            dispatch(Actions.setUserTyping({ userId: data.userId, input: data.input }))
        })

        newSocket.on('user-joined', data => {
            dispatch(Actions.addPlayer(data))
        })

        newSocket.on('user-left', data => {
            dispatch(Actions.removePlayer(data))
        })

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
        debouncedTypingEmit(input)
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
