import { type ReactNode, useReducer } from 'react'
import { Actions } from './actions'
import type { AppState } from './types'
import { reducer } from './reducer'
import { AppContext } from './AppContext'
import { useDebounce } from '../../hooks/useDebounce'
import { useExposeStateForDebugging } from './useExposeStateForDebugging'
import { useSocketConnection } from './useSocketConnection'

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

    // Debounced typing emit - fires at most once per second
    const debouncedTypingEmit = useDebounce((input: string) => {
        state.socket?.emit('typing', input.trim())
    }, 250)

    useExposeStateForDebugging(state)
    useSocketConnection({ dispatch })

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
            state.socket.emit('typing', '')
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
