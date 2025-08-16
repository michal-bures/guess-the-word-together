import {useAppState} from '../contexts/AppContext/AppContext'
import type {AppState} from "../contexts/AppContext/types";

export function QuestionsBoard() {
    const {state} = useAppState()

    const statusMessage = getStatusMessage(state)

    return (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            {/* Question Board */}
            <div className="mb-auto">
                <div className="flex flex-wrap gap-3">
                    {state.gameState.questions.map((pair) => (
                        <div
                            key={pair.id}
                            className="relative bg-blue-500 text-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex-shrink-0 max-w-xs min-w-fit mb-4"
                            style={{minWidth: 82}}
                        >
                            {/* Question Text */}
                            <p className="text-sm font-medium leading-tight">
                                {pair.question}
                            </p>

                            {/* Answer Chip - positioned at bottom right of bubble */}
                            {pair.answer ? (
                                <div
                                    className={`absolute -bottom-4 right-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                                        pair.isCorrectGuess
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : 'bg-white text-gray-700 border border-gray-200'
                                    }`}>
                                    {pair.isCorrectGuess ? '🎉 Correct!' : pair.answer}
                                </div>
                            ) : (
                                <div
                                    className="absolute -bottom-4 right-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-400 text-blue-100 shadow-sm whitespace-nowrap">
                                    <div className="w-1 h-1 bg-blue-200 rounded-full animate-pulse mr-1"></div>
                                    thinking...
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="text-center text-gray-500 mt-8 mb-auto">
                    <p className="text-lg">{statusMessage.title}</p>
                    <p className="text-sm">{statusMessage.subtitle}</p>
                </div>
            </div>
        </div>
    )
}


function getStatusMessage(state: AppState) {
    if (!state.socket?.connected) {
        return {
            title: 'Reconnecting...',
            subtitle: 'Trying to restore connection to the server.'
        }
    } else if (state.gameState.gameOver) {
        return {
            title: `🎉 Correct! The secret word was "${state.gameState.gameOver.secretWord}!"`,
            subtitle: `Click "New Round" to start a new game.`
        }
    } else {
        return {
            title: `I'm thinking about some ${state.gameState.wordCategory}...`,
            subtitle: 'Can you guess the secret word?'
        }
    }
}
