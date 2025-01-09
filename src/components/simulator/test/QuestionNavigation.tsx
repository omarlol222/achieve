import { Button } from "@/components/ui/button";

type QuestionNavigationProps = {
  currentIndex: number;
  totalQuestions: number;
  hasAnswered: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

export function QuestionNavigation({
  currentIndex,
  totalQuestions,
  hasAnswered,
  onPrevious,
  onNext,
  onSubmit,
}: QuestionNavigationProps) {
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentIndex === 0}
      >
        Previous
      </Button>

      {currentIndex === totalQuestions - 1 ? (
        <Button 
          onClick={onSubmit}
          className="bg-[#1B2B2B] hover:bg-[#2C3C3C]"
        >
          Submit Module
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!hasAnswered}
          className="bg-[#1B2B2B] hover:bg-[#2C3C3C]"
        >
          Next Question
        </Button>
      )}
    </div>
  );
}