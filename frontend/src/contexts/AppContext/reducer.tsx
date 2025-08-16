import type { Action } from './actions'
import { Actions } from './actions'
import type { AppState } from './types'

export function reducer(state: AppState, action: Action): AppState {
    console.log('[Action]', action.type, action.payload)
    switch (action.type) {
        case Actions.setSocket.type:
            return { ...state, socket: action.payload }
        case Actions.setConnectionState.type:
            return {
                ...state,
                connected: action.payload.connected,
                currentUserId: action.payload.userId || ''
            }
        case Actions.setGameOver.type:
            return {
                ...state,
                gameState: {
                    ...state.gameState,
                    gameOver: action.payload
                }
            }
        case Actions.addQuestion.type:
            return {
                ...state,
                gameState: {
                    ...state.gameState,
                    questions: [...state.gameState.questions, action.payload]
                }
            }
        case Actions.addAnswer.type:
            return {
                ...state,
                gameState: {
                    ...state.gameState,
                    questions: state.gameState.questions.map(q =>
                        q.id === action.payload.questionId
                            ? {
                                  ...q,
                                  answer: action.payload.answer,
                                  isCorrectGuess: action.payload.isCorrectGuess
                              }
                            : q
                    )
                }
            }
        case Actions.syncGameSessionState.type:
            return {
                ...state,
                gameState: action.payload
            }
        case Actions.setQuestionInput.type:
            return { ...state, questionInput: action.payload }
        case Actions.setConnectedUsers.type:
            return { ...state, connectedUsers: action.payload }
        default:
            return state
    }
}
