import { useEffect } from "react";
import { QuestionCard } from "./test/QuestionCard";
import { QuestionNavigation } from "./test/QuestionNavigation";
import { useQuestionNavigation } from "./test/hooks/useQuestionNavigation";
import { useModuleAnswers } from "./test/hooks/useModuleAnswers";
import { useModuleQuestions } from "./test/hooks/useModuleQuestions";
import { useModuleState } from "./test/hooks/useModuleState";
import { Button } from "@/components/ui/button";

type ModuleTestProps = {
  moduleProgress: {
    id: string;
    module_id: string;
  };
  onComplete?: () => void;
};

export const ModuleTest = ({ moduleProgress, onComplete }: ModuleTestProps) => {
  const { data: questions, isLoading: isLoadingQuestions } = useModuleQuestions(moduleProgress.module_id);
  const { answers, flagged, handleAnswer, toggleFlag } = useModuleAnswers(moduleProgress.id);
  const { isSubmitting, handleSubmitModule } = useModuleState(moduleProgress);
  
  const {
    currentIndex,
    setCurrentIndex,
    goToNext,
    goToPrevious,
    isFirstQuestion,
    isLastQuestion,
  } = useQuestionNavigation(questions?.length || 0);

  useEffect(() => {
    if (onComplete && !isSubmitting) {
      onComplete();
    }
  }, [isSubmitting, onComplete]);

  if (isLoadingQuestions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!questions?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600">No questions available for this module.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="space-y-8">
      <QuestionCard
        question={currentQuestion}
        selectedAnswer={answers[currentQuestion.id]}
        isFlagged={flagged[currentQuestion.id]}
        onAnswerSelect={(answer) => handleAnswer(currentQuestion.id, answer)}
        onFlagToggle={() => toggleFlag(currentQuestion.id)}
      />

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={isFirstQuestion}
        >
          Previous
        </Button>

        <QuestionNavigation
          totalQuestions={questions.length}
          currentIndex={currentIndex}
          answers={answers}
          flagged={flagged}
          onQuestionClick={setCurrentIndex}
        />

        {isLastQuestion ? (
          <Button 
            onClick={handleSubmitModule}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        ) : (
          <Button onClick={goToNext} disabled={isLastQuestion}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
};