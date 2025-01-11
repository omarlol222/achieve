import { memo } from "react";
import { Button } from "@/components/ui/button";

type QuestionGridProps = {
  questions: any[];
  currentIndex: number;
  answers: Record<string, number>;
  flagged: Record<string, boolean>;
  onQuestionSelect: (index: number) => void;
};

export const QuestionGrid = memo(({ 
  questions, 
  currentIndex, 
  answers, 
  flagged, 
  onQuestionSelect 
}: QuestionGridProps) => (
  <div className="space-y-2">
    <h3 className="font-medium">Questions</h3>
    <div className="grid grid-cols-6 gap-2">
      {questions.map((_, index) => {
        const questionId = questions[index].id;
        const isAnswered = answers[questionId] !== undefined;
        const isFlagged = flagged[questionId];
        const isCurrent = index === currentIndex;

        return (
          <Button
            key={index}
            variant={isCurrent ? "default" : "outline"}
            size="sm"
            className={`relative h-10 w-10 p-0 font-medium 
              ${isAnswered ? "bg-green-100" : ""} 
              ${isCurrent ? "ring-2 ring-primary" : ""}
              ${isFlagged ? "border-2 border-yellow-500" : ""}
            `}
            onClick={() => onQuestionSelect(index)}
          >
            {index + 1}
          </Button>
        );
      })}
    </div>
  </div>
));

QuestionGrid.displayName = "QuestionGrid";