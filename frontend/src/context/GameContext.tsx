import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

export interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  userId?: string
  timestamp: Date
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
  connectedUsers: [],
  question: '',
  gamePhase: 'waiting',
  currentRound: 0,
  questionsAsked: 0,
  lastWinner: undefined
}

function gameReducer(state: GameState, action: GameAction): GameState {
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
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: data,
        sender: 'ai',
        timestamp: new Date()
      }
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: newMessage })
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const sendQuestion = () => {
    if (state.socket && state.question.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: state.question,
        sender: 'user',
        userId: state.currentUserId,
        timestamp: new Date()
      }
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMessage })
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
