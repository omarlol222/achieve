
import { cn } from "@/lib/utils";
import { TeXComponent } from "../TeXComponent";
import { Check } from "lucide-react";

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
    <div className="grid grid-cols-1 gap-4 mt-6 max-w-3xl mx-auto">
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
              "w-full text-left p-4 rounded-lg border transition-all duration-200",
              "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-gray-200",
              isCorrect && "bg-green-50 border-green-500",
              isWrong && "bg-red-50 border-red-500",
              "disabled:cursor-default flex items-start gap-4 group"
            )}
          >
            <div 
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center",
                "transition-colors duration-200",
                isSelected ? "border-primary bg-primary text-white" : "border-gray-300 group-hover:border-primary/70",
                isCorrect && "border-green-500 bg-green-500 text-white",
                isWrong && "border-red-500 bg-red-500 text-white"
              )}
            >
              {isSelected ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-white" : "text-gray-500 group-hover:text-primary/70"
                )}>
                  {letter}
                </span>
              )}
            </div>
            <span className="flex-grow pt-1">
              <TeXComponent>{choice}</TeXComponent>
            </span>
          </button>
        );
      })}
    </div>
  );
}
