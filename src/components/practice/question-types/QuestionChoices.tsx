import { cn } from "@/lib/utils";
import { TeXComponent } from "../TeXComponent";

type QuestionChoicesProps = {
  choices: string[];
  selectedAnswer: number | null;
  correctAnswer?: number;
  showFeedback: boolean;
  onAnswerSelect: (answer: number) => void;
};

export function QuestionChoices({ 
  choices, 
  selectedAnswer, 
  correctAnswer, 
  showFeedback, 
  onAnswerSelect 
}: QuestionChoicesProps) {
  return (
    <div className="space-y-3">
      {choices.map((choice, index) => {
        const isSelected = selectedAnswer === index + 1;
        const isCorrect = showFeedback && correctAnswer === index + 1;
        const isWrong = showFeedback && isSelected && !isCorrect;

        return (
          <button
            key={index}
            onClick={() => !showFeedback && onAnswerSelect(index + 1)}
            disabled={showFeedback}
            className={cn(
              "w-full text-left p-4 rounded-lg border transition-colors",
              isSelected ? "border-2" : "border",
              isCorrect
                ? "bg-green-50 border-green-500"
                : isWrong
                ? "bg-red-50 border-red-500"
                : isSelected
                ? "border-gray-400"
                : "border-gray-200 hover:border-gray-400",
              "disabled:cursor-default"
            )}
          >
            <TeXComponent text={choice} />
          </button>
        );
      })}
    </div>
  );
}