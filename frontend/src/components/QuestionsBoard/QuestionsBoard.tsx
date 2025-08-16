import {useAppContext} from '../../contexts/AppContext/AppContext'
import {QuestionBubble} from './QuestionBubble';
import {GameStatusMessage} from '../GameStatusMessage';

export function QuestionsBoard() {
    const {state} = useAppContext()

    return (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            <div className="flex flex-wrap gap-3">
                {state.gameState.questions.map((question) => (
                    <QuestionBubble key={question.id} question={question} />
                ))}
            </div>

            <GameStatusMessage/>
        </div>
    )
}

