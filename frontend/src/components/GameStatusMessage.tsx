import type {AppState} from "../contexts/AppContext/types";
import {useAppContext} from "../contexts/AppContext/AppContext";

export function GameStatusMessage() {
    const { state, startNewRound } = useAppContext();
    const { title, subtitle } = getStatusMessage(state)

    return (
        <div className="flex flex-1 flex-col items-center justify-center text-gray-500 m-8">
            <p className="text-lg">{title}</p>
            <p className="text-sm">{subtitle}</p>

            {state.gameState.gameOver && (
                <button
                    onClick={startNewRound}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                    Play Again
                </button>
            )}
        </div>
    );
}


function getStatusMessage(state: AppState) {
    if (!state.socket?.connected) {
        return {
            title: 'Reconnecting...',
            subtitle: 'Trying to restore connection to the server.'
        }
    } else if (state.gameState.gameOver) {
        return {
            title: `🎉 You guessed it!`,
            subtitle: `The secret word was "${state.gameState.gameOver.secretWord}!".`
        }
    } else {
        return {
            title: `I'm thinking about some ${state.gameState.wordCategory}...`,
            subtitle: 'Can you guess the secret word?'
        }
    }
}
