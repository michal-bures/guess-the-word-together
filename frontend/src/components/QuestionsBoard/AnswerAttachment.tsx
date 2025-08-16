interface AnswerChipProps {
  answer?: string;
  isCorrectGuess?: boolean;
}

export function AnswerAttachment({ answer, isCorrectGuess }: AnswerChipProps) {
  const baseClasses = "absolute -bottom-4 right-2 inline-flex items-center px-2 py-1 rounded-full text-xs shadow-sm whitespace-nowrap";

  if (answer) {
    const answerClasses = isCorrectGuess
      ? "bg-green-100 text-green-800 border border-green-200 font-medium"
      : "bg-white text-gray-700 border border-gray-200 font-medium";

    return (
      <div className={`${baseClasses} ${answerClasses}`}>
        {isCorrectGuess ? '🎉 Yes!' : answer}
      </div>
    );
  }

  // Loading state
  return (
    <div className={`${baseClasses} bg-blue-400 text-blue-100`}>
      <div className="w-1 h-1 bg-blue-200 rounded-full animate-pulse mr-1"></div>
      thinking...
    </div>
  );
}
