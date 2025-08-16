import type { QuestionAnswerPair } from 'shared';
import { AnswerAttachment } from './AnswerAttachment';

interface QuestionCardProps {
  question: QuestionAnswerPair;
}

export function QuestionBubble({ question }: QuestionCardProps) {
  return (
    <div
      className="relative bg-blue-500 text-white p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex-shrink-0 max-w-xs min-w-fit mb-4"
      style={{ minWidth: 82 }}
    >
      <p className="text-sm font-medium leading-tight">
        {question.question}
      </p>
      <AnswerAttachment answer={question.answer} isCorrectGuess={question.isCorrectGuess} />
    </div>
  );
}
