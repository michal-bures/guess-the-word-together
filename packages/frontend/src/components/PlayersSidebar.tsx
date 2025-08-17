import { useAppContext } from '../contexts/AppContext/AppContext'
import type { UserInfo } from 'shared'

export function PlayersSidebar() {
    const { state } = useAppContext()

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
                {Object.values(state.gameState.players).length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <p className="text-sm">No other players yet</p>
                        <p className="text-xs text-gray-400">Share the room to invite friends!</p>
                    </div>
                ) : (
                    Object.values(state.gameState.players).map(user => (
                        <div key={user.id} className="flex items-start space-x-3">
                            {/* Avatar */}
                            <div
                                className="w-8 h-8 bg-gradient-to-br rounded-full flex items-center justify-center text-white text-sm font-medium"
                                style={{ backgroundColor: user.color }}
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </div>

                            {/* Typing Indicator */}
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                {user.currentInput ? (
                                    <div
                                        className="mt-1 bg-gray-100 rounded-lg p-2 border-l-2"
                                        style={{ borderColor: user.color }}
                                    >
                                        <p className="text-xs text-gray-600">{user.currentInput}</p>
                                        <p className="text-sm text-gray-800">{isTyping(user)}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400">Ready to play</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Game Status */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">Game Status</p>
                    <div className="space-y-1">
                        {!state.gameState.gameOver && (
                            <>
                                <p className="text-xs text-green-600">Playing!</p>
                            </>
                        )}
                        {state.gameState.gameOver && (
                            <p className="text-xs text-blue-600">Game over!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function isTyping(user: UserInfo) {
    return (user.lastTyped ?? 0) > Date.now() - 5000
}
