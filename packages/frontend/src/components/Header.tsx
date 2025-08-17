import { useAppContext } from '../contexts/AppContext/AppContext'

export function Header() {
    const { state, giveUp } = useAppContext()

    // Only show Give up button during active gameplay (not when game is over)
    const showGiveUpButton = state.connected && !state.gameState.gameOver

    return (
        <div className="bg-white border-b border-gray-200 p-4 h-16 flex items-center">
            <div className="flex items-center justify-between w-full">
                <h1 className="text-2xl font-bold text-gray-900">Guess the Word Together</h1>
                {showGiveUpButton && (
                    <button
                        onClick={giveUp}
                        className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors"
                    >
                        Give up
                    </button>
                )}
            </div>
        </div>
    )
}
