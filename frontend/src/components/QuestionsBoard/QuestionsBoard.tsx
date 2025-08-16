import {useAppState} from '../../contexts/AppContext/AppContext'
import type {AppState} from "../../contexts/AppContext/types";
import { QuestionBubble } from './QuestionBubble';
import { GameStatus } from '../GameStatus';

export function QuestionsBoard() {
    const {state} = useAppState()

    const statusMessage = getStatusMessage(state)

    return (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
            {/* Question Board */}
            <div className="mb-auto">
                <div className="flex flex-wrap gap-3">
                    {state.gameState.questions.map((question) => (
                        <QuestionBubble key={question.id} question={question} />
                    ))}
                </div>
                <GameStatus title={statusMessage.title} subtitle={statusMessage.subtitle} />
            </div>
        </div>
    )
}


function getStatusMessage(state: AppState) {
    if (!state.socket?.connected) {
        return {
            title: 'Reconnecting...',
            subtitle: 'Trying to restore connection to the server.'
        }
    } else if (state.gameState.gameOver) {
        return {
            title: `🎉 Correct! The secret word was "${state.gameState.gameOver.secretWord}!"`,
            subtitle: `Click "New Round" to start a new game.`
        }
    } else {
        return {
            title: `I'm thinking about some ${state.gameState.wordCategory}...`,
            subtitle: 'Can you guess the secret word?'
        }
    }
}
