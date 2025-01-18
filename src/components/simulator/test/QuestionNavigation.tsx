import { memo } from "react";
import { Button } from "@/components/ui/button";

type QuestionNavigationProps = {
  currentIndex: number;
  totalQuestions: number;
  answers: Record<string, number>;
  flagged: Record<string, boolean>;
  onQuestionClick: (index: number) => void;
};

export const QuestionNavigation = memo(({
  currentIndex,
  totalQuestions,
  answers,
  flagged,
  onQuestionClick,
}: QuestionNavigationProps) => {
  const questionNumbers = Array.from({ length: totalQuestions }, (_, i) => i);

  return (
    <div className="flex gap-2 justify-center">
      {questionNumbers.map((index) => {
        const isActive = currentIndex === index;
        const isAnswered = Object.keys(answers).length > index;
        const isFlagged = Object.values(flagged)[index];

        return (
          <Button
            key={index}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onQuestionClick(index)}
            className={`w-10 h-10 p-0 ${isAnswered ? "bg-green-100" : ""} ${
              isFlagged ? "border-yellow-500 border-2" : ""
            }`}
          >
            {index + 1}
          </Button>
        );
      })}
    </div>
  );
});

QuestionNavigation.displayName = "QuestionNavigation";