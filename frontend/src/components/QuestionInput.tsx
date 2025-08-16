import {Actions} from "../contexts/AppContext/actions";
import {useAppState} from "../contexts/AppContext/AppContext";

export function QuestionInput() {
    const {state, dispatch, sendQuestion} = useAppState()

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
                    onChange={(e) => dispatch(Actions.setQuestionInput(e.target.value))}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a yes/no question about the word..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                    onClick={sendQuestion}
                    disabled={!state.connected || !state.questionInput.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    Ask
                </button>
            </div>
        </div>
    )
}
