import { cn } from "@/lib/utils";
import { Check, Flag } from "lucide-react";

type QuestionGridProps = {
  questions: any[];
  currentIndex: number;
  answers: Record<string, number>;
  flagged: Record<string, boolean>;
  onQuestionSelect: (index: number) => void;
};

export const QuestionGrid = ({
  questions,
  currentIndex,
  answers,
  flagged,
  onQuestionSelect,
}: QuestionGridProps) => {
  return (
    <div>
      <h3 className="font-medium mb-3">Questions Overview</h3>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((_, index) => {
          const isAnswered = answers[index] !== undefined;
          const isFlagged = flagged[index];
          const isCurrent = currentIndex === index;

          return (
            <button
              key={index}
              onClick={() => onQuestionSelect(index)}
              className={cn(
                "h-10 w-full rounded-md border flex items-center justify-center relative",
                isCurrent && "border-primary border-2",
                isAnswered && "bg-green-50",
                !isAnswered && "bg-gray-50"
              )}
            >
              <span className="text-sm">{index + 1}</span>
              {isAnswered && (
                <Check className="absolute -top-1 -right-1 h-3 w-3 text-green-600" />
              )}
              {isFlagged && (
                <Flag className="absolute -bottom-1 -right-1 h-3 w-3 text-yellow-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};