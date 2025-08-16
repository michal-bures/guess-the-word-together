import {useAppContext} from '../../contexts/AppContext/AppContext'
import {QuestionBubble} from './QuestionBubble';
import {GameStatusMessage} from '../GameStatusMessage';
import { useScrollToBottom } from '../../hooks/useScrollToBottom';
import {useEffect, useRef} from "react";

export function QuestionsBoard() {
    const {state} = useAppContext()

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { scrollToBottom } = useScrollToBottom<HTMLDivElement>(scrollContainerRef)

    // Scroll to bottom when new questions are added
    useEffect(() => {
        if (state.gameState.questions.length)  scrollToBottom();
    }, [state.gameState.questions.length]);

    return (
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col">
            <div className="flex flex-wrap gap-3">
                {state.gameState.questions.map((question) => (
                    <QuestionBubble key={question.id} question={question} />
                ))}
            </div>

            <GameStatusMessage/>
        </div>
    )
}

