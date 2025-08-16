import {createContext, type ReactNode, useContext, useEffect, useReducer, useRef} from 'react'
import {io} from 'socket.io-client'
import {rootReducer} from "./rootReducer.tsx";
import type {GameState, QuestionAnswerPair} from "./types.ts";
import {type Action, Actions} from "./actions.tsx";

const initialState: GameState = {
  socket: null,
  connected: false,
  currentUserId: '',
  questionAnswerPairs: [],
  connectedUsers: [],
  question: '',
  gamePhase: 'waiting',
  currentRound: 0,
  questionsAsked: 0,
  currentCategory: undefined,
  lastWinner: undefined,
  statusMessage: 'Welcome! Click "New Round" to start playing.'
}

interface GameContextType {
  state: GameState
  dispatch: React.Dispatch<Action>
  sendQuestion: () => void
  startNewRound: () => void
  formatTime: (date: Date) => string
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(rootReducer, initialState)

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
      console.log('Status Message:', currentState.statusMessage);
      console.log('Current Category:', currentState.currentCategory);
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
    dispatch(Actions.setSocket(newSocket))

    newSocket.on('connect', () => {
      dispatch(Actions.setConnectionState({
        connected: true,
        userId: newSocket.id!
      }))
      console.log('Connected to server')
    })

    newSocket.on('disconnect', () => {
      dispatch(Actions.setConnectionState({ connected: false, userId: '' }))
      console.log('Disconnected from server')
    })

    // Handle status messages
    newSocket.on('status-message', (message: string) => {
      dispatch(Actions.setStatusMessage(message))
    })

    // Handle new round starting
    newSocket.on('round-started', (data: { round: number; category: string; message: string }) => {
      dispatch(Actions.startNewRound({ round: data.round, category: data.category, statusMessage: data.message }))
    })

    // Handle question answers
    newSocket.on('question-answered', (data: { questionId: string; answer: string; isCorrectGuess: boolean }) => {
      dispatch(Actions.updateAnswer({ questionId: data.questionId, answer: data.answer, isCorrectGuess: data.isCorrectGuess }))
    })

    // Handle game won
    newSocket.on('game-won', (data: { winner: string; word: string; message: string }) => {
      dispatch(Actions.setGamePhase('won' as const))
      dispatch(Actions.setStatusMessage(data.message))
    })

    // Legacy support for test-response
    newSocket.on('test-response', (data: string) => {
      // For now, treat all test-response as answers to the most recent question
      const state = stateRef.current;
      const mostRecentQuestion = state.questionAnswerPairs[state.questionAnswerPairs.length - 1]
      if (mostRecentQuestion && !mostRecentQuestion.answer) {
        dispatch(Actions.updateAnswer({
          questionId: mostRecentQuestion.id,
          answer: data,
          isCorrectGuess: data.includes('🎉')
        }))
      }
    })

    newSocket.on('game-state-sync', (data: { roundNumber: number; category: string; questions: any[] }) => {
      console.log('Syncing game state:', data);
      dispatch(Actions.syncGameState({
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
      }));
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const sendQuestion = () => {
    if (state.socket && state.question.trim()) {
      const questionId = crypto.randomUUID()

      // Add question to board immediately
      const questionPair: QuestionAnswerPair = {
        id: questionId,
        question: state.question,
        userId: state.currentUserId,
        timestamp: new Date()
      }
      dispatch(Actions.addQuestion(questionPair))

      state.socket.emit('ask-question', {
        questionId: questionId,
        question: state.question
      })

      dispatch(Actions.setQuestionInput(''))
    }
  }

  const startNewRound = () => {
    if (state.socket) {
      state.socket.emit('start-game')
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <GameContext.Provider value={{ state, dispatch, sendQuestion, startNewRound, formatTime }}>
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
