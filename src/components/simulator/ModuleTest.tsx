import { useEffect } from "react";
import { QuestionCard } from "./test/QuestionCard";
import { QuestionNavigation } from "./test/QuestionNavigation";
import { useQuestionNavigation } from "./test/hooks/useQuestionNavigation";
import { useModuleAnswers } from "./test/hooks/useModuleAnswers";
import { useModuleQuestions } from "./test/hooks/useModuleQuestions";
import { useModuleState } from "./test/hooks/useModuleState";
import { Button } from "@/components/ui/button";
import { TestHeader } from "./test/TestHeader";
import { useToast } from "@/hooks/use-toast";
import { ModuleOverview } from "./ModuleOverview";

type ModuleTestProps = {
  moduleProgress: {
    id: string;
    module_id: string;
    module?: {
      name?: string;
      time_limit?: number;
    };
  };
  onComplete?: () => void;
};

export const ModuleTest = ({ moduleProgress, onComplete }: ModuleTestProps) => {
  const { toast } = useToast();
  const { data: questions = [], isLoading: isLoadingQuestions, error } = useModuleQuestions(moduleProgress.module_id);
  const { answers, flagged, handleAnswer, toggleFlag } = useModuleAnswers(moduleProgress.id);
  const { isSubmitting, handleSubmitModule } = useModuleState(moduleProgress);
  
  const {
    currentIndex,
    setCurrentIndex,
    goToNext,
    goToPrevious,
    isFirstQuestion,
    isLastQuestion,
    timeLeft,
  } = useQuestionNavigation(questions.length || 0, moduleProgress.module?.time_limit || 30);

  useEffect(() => {
    if (timeLeft === 0) {
      toast({
        title: "Time's up!",
        description: "Your answers will be submitted automatically.",
      });
      handleSubmitModule();
    }
  }, [timeLeft, handleSubmitModule, toast]);

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

  if (error) {
    console.error("Error loading questions:", error);
    return (
      <div className="text-center py-8">
        <p className="text-lg text-red-600">Error loading questions. Please try again.</p>
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

  if (!currentQuestion) {
    console.error("Current question is undefined. Index:", currentIndex, "Total questions:", questions.length);
    return (
      <div className="text-center py-8">
        <p className="text-lg text-red-600">Error loading current question. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <TestHeader
          moduleName={moduleProgress.module?.name || "Module"}
          timeLeft={timeLeft}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
        />
        <ModuleOverview
          moduleName={moduleProgress.module?.name || "Module"}
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          flagged={flagged}
          onQuestionSelect={setCurrentIndex}
          onSubmit={handleSubmitModule}
        />
      </div>

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
          onQuestionSelect={setCurrentIndex}
        />

        {isLastQuestion ? (
          <Button 
            onClick={handleSubmitModule}
            disabled={isSubmitting}
            className="bg-[#1B2B2B] hover:bg-[#2C3C3C]"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        ) : (
          <Button 
            onClick={goToNext} 
            disabled={isLastQuestion}
            className="bg-[#1B2B2B] hover:bg-[#2C3C3C]"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};