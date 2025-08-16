import type {GameSessionState} from "./types.ts";
import type {Action} from "./actions.ts";

export function rootReducer(state: GameSessionState, action: Action): GameSessionState {
    console.log('[Action]', action.type, action.payload)
    switch (action.type) {
        case 'SET_SOCKET':
            return {...state, socket: action.payload}
        case 'SET_CONNECTION_STATE':
            return {
                ...state,
                connected: action.payload.connected,
                currentUserId: action.payload.userId || ''
            }
        case 'SET_STATUS_MESSAGE':
            return {...state, statusMessage: action.payload}
        case 'ADD_QUESTION':
            return {
                ...state,
                questionAnswerPairs: [...state.questionAnswerPairs, action.payload],
                questionsAsked: state.questionsAsked + 1
            }
        case 'UPDATE_ANSWER':
            return {
                ...state,
                questionAnswerPairs: state.questionAnswerPairs.map(pair =>
                    pair.id === action.payload.questionId
                        ? {...pair, answer: action.payload.answer, isCorrectGuess: action.payload.isCorrectGuess}
                        : pair
                )
            }
        case 'SYNC_GAME_STATE':
            return {
                ...state,
                currentRound: action.payload.roundNumber,
                questionAnswerPairs: action.payload.questions,
                questionsAsked: action.payload.questions.length,
                gamePhase: 'playing'
            }
        case 'SET_QUESTION_INPUT':
            return {...state, question: action.payload}
        case 'SET_CONNECTED_USERS':
            return {...state, connectedUsers: action.payload}
        case 'SET_GAME_PHASE':
            return {...state, gamePhase: action.payload}
        case 'START_NEW_ROUND':
            return {
                ...state,
                currentRound: action.payload.round,
                currentCategory: action.payload.category,
                statusMessage: action.payload.statusMessage,
                questionsAsked: 0,
                questionAnswerPairs: [], // Clear board for new round
                gamePhase: 'playing'
            }
        case 'GAME_WON':
            return {
                ...state,
                gamePhase: 'won',
                lastWinner: action.payload.winner,
                statusMessage: `🎉 ${action.payload.winner} won! The word was "${action.payload.word}". Click "New Round" to play again.`
            }
        default:
            return state
    }
}
