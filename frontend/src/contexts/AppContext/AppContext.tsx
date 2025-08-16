import {createContext, useContext} from 'react'
import {type Action} from "./actions";
import type {AppState} from "./types";

interface GameContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
  sendQuestion: () => void
  startNewRound: () => void
  formatTime: (date: Date) => string
}

export const AppContext = createContext<GameContextType | undefined>(undefined)

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a GameProvider');
  }
  return context;
}
