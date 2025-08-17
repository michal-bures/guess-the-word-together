import { useAppContext } from '../contexts/AppContext/AppContext'
import type { UserInfo } from 'shared'
import { getCurrentPlayer } from '../contexts/AppContext/selectors'

export function PlayersSidebar() {
    const { state } = useAppContext()
    const otherPlayers = Object.values(state.gameState.players).filter(
        player => player.id !== state.currentUserId
    )

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 h-16 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Players Online</h2>
                <div className="flex items-center">
                    <div
                        className={`w-2 h-2 rounded-full mr-2 ${state.connected ? 'bg-green-500' : 'bg-red-500'}`}
                    ></div>
                    {state.connected ? 'Connected' : 'Disconnected'}
                </div>
            </div>

            <div className="flex-1 p-4 space-y-4">
                {otherPlayers.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <p className="text-sm">No other players yet</p>
                        <p className="text-xs text-gray-400">Share the link to invite friends!</p>
                    </div>
                ) : (
                    otherPlayers.map(player => (
                        <div key={player.id} className="flex items-start space-x-3">
                            {/* Avatar */}
                            <div
                                className="w-8 h-8 bg-gradient-to-br rounded-full flex items-center justify-center text-white text-sm font-medium"
                                style={{ backgroundColor: player.color }}
                            >
                                {player.name.charAt(0).toUpperCase()}
                            </div>

                            {/* Typing Indicator */}
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{player.name}</p>
                                {player.currentInput ? (
                                    <div
                                        className="mt-1 bg-gray-100 rounded-lg p-2 border-l-2"
                                        style={{ borderColor: player.color }}
                                    >
                                        <p className="text-xs text-gray-600">
                                            {player.currentInput}
                                        </p>
                                        <p className="text-sm text-gray-800">{isTyping(player)}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400">Ready to play</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Current Player Info */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                {getCurrentPlayer(state) ? (
                    <div className="flex items-center space-x-3 h-10">
                        {/* Player Avatar */}
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: getCurrentPlayer(state)!.color }}
                        >
                            {getCurrentPlayer(state)!.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Player Details */}
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                {getCurrentPlayer(state)?.name ?? 'Unknown Player'}
                            </p>
                            <p className="text-xs text-gray-500">That's you!</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center h-10 flex items-center justify-center">
                        <p className="text-sm text-gray-500">Connecting...</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function isTyping(user: UserInfo) {
    return (user.lastTyped ?? 0) > Date.now() - 5000
}
