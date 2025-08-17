import { useAppContext } from '../contexts/AppContext/AppContext'
import { getCurrentPlayer } from '../contexts/AppContext/selectors'

export function QuestionInput() {
    const { state, sendQuestion, updateQuestionInput } = useAppContext()

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            sendQuestion()
        }
    }

    return (
        <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={state.questionInput}
                    onChange={e => updateQuestionInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a yes/no question about the word..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-10 focus:border-blue-500"
                />
                <button
                    onClick={sendQuestion}
                    disabled={!state.connected || !state.questionInput.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    style={{ backgroundColor: getCurrentPlayer(state)?.color }}
                >
                    Ask
                </button>
            </div>
        </div>
    )
}
