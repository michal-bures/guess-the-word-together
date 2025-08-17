import { useEffect } from 'react'
import { io } from 'socket.io-client'
import type { TypedSocket } from './types'
import { type Action, Actions } from './actions'
import type { QuestionAnswerPair } from 'shared'

interface Props {
    dispatch: (action: Action) => void
}

export function useSocketConnection({ dispatch }: Props) {
    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin
        const newSocket: TypedSocket = io(backendUrl)

        // Set socket in state
        dispatch(Actions.setSocket(newSocket))

        // Connection events
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

        // Game events
        newSocket.on('question-updated', (data: QuestionAnswerPair) => {
            dispatch(Actions.addQuestion(data))
            if (!data.answer) {
                // User just asked a question => clear their input
                dispatch(Actions.setUserTyping({ userId: data.userId, input: '' }))
            }
        })

        newSocket.on('user-typing', data => {
            dispatch(Actions.setUserTyping({ userId: data.userId, input: data.input }))
        })

        newSocket.on('user-joined', data => {
            dispatch(Actions.addPlayer(data))
        })

        newSocket.on('user-left', data => {
            dispatch(Actions.removePlayer(data))
        })

        newSocket.on('game-over', data => {
            dispatch(Actions.setGameOver(data))
        })

        newSocket.on('game-state-sync', data => {
            dispatch(Actions.syncGameSessionState(data))
        })

        // Cleanup function
        return () => {
            newSocket.close()
        }
    }, [dispatch])
}
