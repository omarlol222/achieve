import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Flag } from "lucide-react";

type TestNavigationProps = {
  currentQuestionIndex: number;
  totalQuestions: number;
  flagged: Record<string, boolean>;
  onPrevious: () => void;
  onNext: () => void;
  onFlag: () => void;
  onComplete: () => void;
};

export function TestNavigation({
  currentQuestionIndex,
  totalQuestions,
  flagged,
  onPrevious,
  onNext,
  onFlag,
  onComplete,
}: TestNavigationProps) {
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <Button
        variant="outline"
        onClick={onFlag}
      >
        <Flag className={`h-4 w-4 ${flagged[currentQuestionIndex] ? 'fill-yellow-500' : ''}`} />
      </Button>

      <Button
        onClick={() => {
          if (isLastQuestion) {
            onComplete();
          } else {
            onNext();
          }
        }}
      >
        {isLastQuestion ? (
          "Complete Module"
        ) : (
          <>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}