import type { Answer, GameOverInfo, GameSessionState, QuestionAnswerPair } from 'shared'
import type { ConnectedUser, TypedSocket } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActionCreatorReturn<T> = T extends (...args: any[]) => infer R ? R : never
export type Action = ActionCreatorReturn<(typeof Actions)[keyof typeof Actions]>

const createAction =
    <P>() =>
    <T extends string>(type: T) => {
        const actionCreator = (payload: P) => ({ type, payload }) as const
        actionCreator.type = type
        return actionCreator
    }

export const Actions = {
    setSocket: createAction<TypedSocket>()('SET_SOCKET'),
    setConnectionState: createAction<{ connected: boolean; userId?: string }>()(
        'SET_CONNECTION_STATE'
    ),

    addQuestion: createAction<QuestionAnswerPair>()('ADD_QUESTION'),
    setQuestionInput: createAction<string>()('SET_QUESTION_INPUT'),
    addAnswer: createAction<Answer>()('ADD_ANSWER'),
    setGameOver: createAction<GameOverInfo>()('SET_GAME_OVER'),

    syncGameSessionState: createAction<GameSessionState>()('SET_GAME_SESSION_STATE'),
    setConnectedUsers: createAction<ConnectedUser[]>()('SET_CONNECTED_USERS')
}
