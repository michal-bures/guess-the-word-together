import { useAppContext } from '../contexts/AppContext/AppContext'

export function Header() {
  const { state, startNewRound } = useAppContext()

  return (
    <div className="bg-white border-b border-gray-200 p-4 h-16 flex items-center">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold text-gray-900">
          Guess the Word Together
        </h1>

        <button
          onClick={startNewRound}
          disabled={!state.connected}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Restart
        </button>
      </div>
    </div>
  )
}
