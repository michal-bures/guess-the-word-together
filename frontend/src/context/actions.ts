import type { QuestionAnswerPair } from "shared";
import type {ConnectedUser, TypedSocket} from "./types.ts";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActionCreatorReturn<T> = T extends (...args: any[]) => infer R ? R : never
export type Action = ActionCreatorReturn<typeof Actions[keyof typeof Actions]>

const createAction = <P>() => <T extends string>(type: T) =>
    (payload: P) => ({ type, payload } as const)

export const Actions = {
    setSocket: createAction<TypedSocket>()('SET_SOCKET'),
    setConnectionState: createAction<{ connected: boolean; userId?: string }>()('SET_CONNECTION_STATE'),
    addQuestion: createAction<QuestionAnswerPair>()('ADD_QUESTION'),
    updateAnswer: createAction<{ questionId: string; answer: string; isCorrectGuess?: boolean }>()('UPDATE_ANSWER'),
    syncGameSessionState: createAction<{ roundNumber: number; category: string; questions: QuestionAnswerPair[] }>()('SYNC_GAME_STATE'),
    setQuestionInput: createAction<string>()('SET_QUESTION_INPUT'),
    setConnectedUsers: createAction<ConnectedUser[]>()('SET_CONNECTED_USERS'),
    setGamePhase: createAction<'waiting' | 'playing' | 'won'>()('SET_GAME_PHASE'),
    startNewRound: createAction<{ round: number; category: string; statusMessage: string }>()('START_NEW_ROUND'),
    gameWon: createAction<{ winner: string; word: string }>()('GAME_WON'),
    setStatusMessage: createAction<string>()('SET_STATUS_MESSAGE'),
}

