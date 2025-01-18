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
    <div className="grid grid-cols-1 gap-4 mt-6">
      {choices.map((choice, index) => {
        const isSelected = selectedAnswer === index + 1;
        const isCorrect = showFeedback && correctAnswer === index + 1;
        const isWrong = showFeedback && isSelected && !isCorrect;
        const letter = String.fromCharCode(65 + index); // Convert 0,1,2,3 to A,B,C,D

        return (
          <button
            key={index}
            onClick={() => !showFeedback && onAnswerSelect(index + 1)}
            disabled={showFeedback}
            className={cn(
              "w-full text-left p-4 rounded-lg border transition-colors",
              "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isSelected ? "border-primary bg-primary/5" : "border-gray-200",
              isCorrect && "bg-green-50 border-green-500",
              isWrong && "bg-red-50 border-red-500",
              "disabled:cursor-default flex items-start gap-4"
            )}
          >
            <span 
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                isSelected ? "border-primary text-primary" : "border-gray-400 text-gray-400",
                isCorrect && "border-green-500 text-green-500",
                isWrong && "border-red-500 text-red-500"
              )}
            >
              {letter}
            </span>
            <span className="flex-grow pt-1">
              <TeXComponent>{choice}</TeXComponent>
            </span>
          </button>
        );
      })}
    </div>
  );
}