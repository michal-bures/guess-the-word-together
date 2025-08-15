import { useGame } from '../context/GameContext'

export function Header() {
  const { state } = useGame()

  return (
    <div className="bg-white border-b border-gray-200 p-4 h-16 flex items-center">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold text-gray-900">
          Guess the Word Together
        </h1>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${state.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {state.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </div>
  )
}