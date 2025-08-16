import { GameSessionState } from "shared";

export interface BackendGameSessionState extends GameSessionState {
    secretWord: string;
}
