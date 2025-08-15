import { useGame } from '../context/GameContext'

export function ChatArea() {
  const { state } = useGame()

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Game Status Messages */}
      {state.chatMessages.length > 0 && (
        <div className="mb-6 space-y-2">
          {state.chatMessages.map((msg) => (
            <div key={msg.id} className="flex justify-center">
              <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm max-w-md text-center">
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Board */}
      {state.questionAnswerPairs.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-lg">Ask your first question to start building the board!</p>
          <p className="text-sm">Questions will appear as bubbles with their answers attached.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {state.questionAnswerPairs.map((pair) => (
            <div
              key={pair.id}
              className="relative bg-blue-500 text-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex-shrink-0 max-w-xs min-w-fit mb-4"
            >
              {/* Question Text */}
              <p className="text-sm font-medium leading-tight">
                {pair.question}
              </p>

              {/* Answer Chip - positioned at bottom right of bubble */}
              {pair.answer ? (
                <div className={`absolute -bottom-4 right-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                  pair.isCorrectGuess 
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}>
                  {pair.answer}
                </div>
              ) : (
                <div className="absolute -bottom-4 right-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-400 text-blue-100 shadow-sm">
                  <div className="w-1 h-1 bg-blue-200 rounded-full animate-pulse mr-1"></div>
                  thinking...
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
