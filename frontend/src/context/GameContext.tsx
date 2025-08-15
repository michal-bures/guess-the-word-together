import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

export interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  userId?: string
  timestamp: Date
}

export interface QuestionAnswerPair {
  id: string
  question: string
  answer?: string
  userId: string
  timestamp: Date
  isCorrectGuess?: boolean
}

export interface ConnectedUser {
  id: string
  name: string
  typing: string
  lastTyped: Date
}

interface GameState {
  socket: Socket | null
  connected: boolean
  currentUserId: string
  chatMessages: ChatMessage[]
  questionAnswerPairs: QuestionAnswerPair[]
  connectedUsers: ConnectedUser[]
  question: string
  gamePhase: 'waiting' | 'playing' | 'round_ending'
  currentRound: number
  questionsAsked: number
  lastWinner?: string
}

type GameAction =
  | { type: 'SET_SOCKET'; payload: Socket }
  | { type: 'SET_CONNECTION_STATE'; payload: { connected: boolean; userId?: string } }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'ADD_QUESTION'; payload: QuestionAnswerPair }
  | { type: 'UPDATE_ANSWER'; payload: { questionId: string; answer: string; isCorrectGuess?: boolean } }
  | { type: 'SYNC_GAME_STATE'; payload: { roundNumber: number; category: string; questions: QuestionAnswerPair[] } }
  | { type: 'SET_QUESTION'; payload: string }
  | { type: 'SET_CONNECTED_USERS'; payload: ConnectedUser[] }
  | { type: 'SET_GAME_PHASE'; payload: 'waiting' | 'playing' | 'round_ending' }
  | { type: 'START_NEW_ROUND'; payload: { round: number; winner?: string } }
  | { type: 'INCREMENT_QUESTIONS'; payload: never }

const initialState: GameState = {
  socket: null,
  connected: false,
  currentUserId: '',
  chatMessages: [],
  questionAnswerPairs: [],
  connectedUsers: [],
  question: '',
  gamePhase: 'waiting',
  currentRound: 0,
  questionsAsked: 0,
  lastWinner: undefined
}

function gameReducer(state: GameState, action: GameAction): GameState {
  console.log('[Action]', action.type, action.payload)
  switch (action.type) {
    case 'SET_SOCKET':
      return { ...state, socket: action.payload }
    case 'SET_CONNECTION_STATE':
      return {
        ...state,
        connected: action.payload.connected,
        currentUserId: action.payload.userId || ''
      }
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
        questionsAsked: action.payload.sender === 'user' ? state.questionsAsked + 1 : state.questionsAsked
      }
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
            ? { ...pair, answer: action.payload.answer, isCorrectGuess: action.payload.isCorrectGuess }
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
    case 'SET_QUESTION':
      return { ...state, question: action.payload }
    case 'SET_CONNECTED_USERS':
      return { ...state, connectedUsers: action.payload }
    case 'SET_GAME_PHASE':
      return { ...state, gamePhase: action.payload }
    case 'START_NEW_ROUND':
      return {
        ...state,
        currentRound: action.payload.round,
        lastWinner: action.payload.winner,
        questionsAsked: 0,
        questionAnswerPairs: [], // Clear board for new round
        gamePhase: 'playing'
      }
    case 'INCREMENT_QUESTIONS':
      return { ...state, questionsAsked: state.questionsAsked + 1 }
    default:
      return state
  }
}

interface GameContextType {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  sendQuestion: () => void
  formatTime: (date: Date) => string
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Create a ref to store the current state for debugging
  const stateRef = useRef(state);
  stateRef.current = state;

  // Expose game state to global scope for debugging (only setup once)
  useEffect(() => {
    (window as any).dumpGameState = () => {
      const currentState = stateRef.current;
      console.group('🎮 Game State Debug');
      console.log('Full State:', currentState);
      console.log('Connection:', { connected: currentState.connected, userId: currentState.currentUserId });
      console.log('Game Phase:', currentState.gamePhase);
      console.log('Current Round:', currentState.currentRound);
      console.log('Questions Asked:', currentState.questionsAsked);
      console.log('Last Winner:', currentState.lastWinner);
      console.log('Chat Messages:', currentState.chatMessages);
      console.log('Q&A Pairs:', currentState.questionAnswerPairs);
      console.log('Connected Users:', currentState.connectedUsers);
      console.groupEnd();
      return currentState;
    };

    // Also provide direct access to current state
    Object.defineProperty(window, 'gameState', {
      get: () => stateRef.current,
      configurable: true
    });
  }, []); // Empty dependency array - only runs once

  useEffect(() => {
    const newSocket = io('http://localhost:3001')
    dispatch({ type: 'SET_SOCKET', payload: newSocket })

    newSocket.on('connect', () => {
      dispatch({
        type: 'SET_CONNECTION_STATE',
        payload: { connected: true, userId: newSocket.id! }
      })
      console.log('Connected to server')
    })

    newSocket.on('disconnect', () => {
      dispatch({
        type: 'SET_CONNECTION_STATE',
        payload: { connected: false, userId: '' }
      })
      console.log('Disconnected from server')
    })

    newSocket.on('test-response', (data: string) => {
      // Handle AI responses - could be answer to question or round info
      if (data.includes('🎉') || data.includes('Round') || data.includes('Welcome')) {
        // This is a game status message, add to chat
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          text: data,
          sender: 'ai',
          timestamp: new Date()
        }
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: newMessage })
      } else {
        // This is an answer to the most recent question
        const state = stateRef.current;
        const mostRecentQuestion = state.questionAnswerPairs[state.questionAnswerPairs.length - 1]
        if (mostRecentQuestion && !mostRecentQuestion.answer) {
          dispatch({
            type: 'UPDATE_ANSWER',
            payload: {
              questionId: mostRecentQuestion.id,
              answer: data,
              isCorrectGuess: data.includes('🎉')
            }
          })
        }
      }
    })

    newSocket.on('game-state-sync', (data: { roundNumber: number; category: string; questions: any[] }) => {
      console.log('Syncing game state:', data);
      dispatch({
        type: 'SYNC_GAME_STATE',
        payload: {
          roundNumber: data.roundNumber,
          category: data.category,
          questions: data.questions.map(q => ({
            id: q.id,
            question: q.question,
            answer: q.answer,
            userId: q.userId,
            timestamp: new Date(q.timestamp),
            isCorrectGuess: q.isCorrectGuess
          }))
        }
      });
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const sendQuestion = () => {
    if (state.socket && state.question.trim()) {
      const questionId = Date.now().toString()

      // Add question to board immediately
      const questionPair: QuestionAnswerPair = {
        id: questionId,
        question: state.question,
        userId: state.currentUserId,
        timestamp: new Date()
      }
      dispatch({ type: 'ADD_QUESTION', payload: questionPair })

      // Send to server and clear input
      state.socket.emit('test-message', state.question)
      dispatch({ type: 'SET_QUESTION', payload: '' })
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <GameContext.Provider value={{ state, dispatch, sendQuestion, formatTime }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
