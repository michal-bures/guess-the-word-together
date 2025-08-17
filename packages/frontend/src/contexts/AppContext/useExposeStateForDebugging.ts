import { useEffect, useRef } from 'react'
import type { AppState } from './types'

/**
 * Custom hook to expose app state to global scope for debugging
 * Only active in development mode
 */
export function useExposeStateForDebugging(state: AppState) {
    // Create a ref to store the current state for debugging
    const stateRef = useRef(state)
    stateRef.current = state

    // Expose game state to global scope for debugging (only setup once)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            window.getAppState = () => {
                console.log('AppState:', stateRef.current)
            }

            // Also provide direct access to current state
            Object.defineProperty(window, 'GameSessionState', {
                get: () => stateRef.current,
                configurable: true
            })
        }
    }, []) // Empty dependency array - only runs once
}
