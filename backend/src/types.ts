import { GameState } from "shared";

export interface BackendGameState extends GameState {
    secretWord: string;
}
