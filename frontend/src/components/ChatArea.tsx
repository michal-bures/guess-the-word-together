import { useGame } from '../context/GameContext'

export function ChatArea() {
  const { state, formatTime } = useGame()

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {state.chatMessages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-lg">Ask your first question to start the game!</p>
          <p className="text-sm">The AI will respond with yes, no, or maybe.</p>
        </div>
      ) : (
        state.chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${
                msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}