import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { QuestionCard } from "./test/QuestionCard";
import { QuestionNavigation } from "./test/QuestionNavigation";
import { TestHeader } from "./test/TestHeader";
import { useQuestionNavigation } from "./test/hooks/useQuestionNavigation";
import { useModuleAnswers } from "./test/hooks/useModuleAnswers";
import { useModuleQuestions } from "./test/hooks/useModuleQuestions";
import { supabase } from "@/integrations/supabase/client";

type ModuleTestProps = {
  moduleProgress: {
    id: string;
    module: {
      id: string;
      name: string;
      time_limit: number;
    };
  };
  onComplete: () => void;
};

export function ModuleTest({ moduleProgress, onComplete }: ModuleTestProps) {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(moduleProgress.module.time_limit * 60);

  // Custom hooks
  const { data: questions, isLoading } = useModuleQuestions(moduleProgress.module.id);
  const { answers, flagged, handleAnswer, toggleFlag } = useModuleAnswers(moduleProgress.id);
  const { 
    currentIndex, 
    setCurrentIndex, 
    isLastQuestion,
    isFirstQuestion 
  } = useQuestionNavigation(questions?.length || 0);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async () => {
    try {
      const { error: progressError } = await supabase
        .from("module_progress")
        .update({ 
          completed_at: new Date().toISOString(),
        })
        .eq("id", moduleProgress.id);

      if (progressError) throw progressError;

      onComplete();
    } catch (error: any) {
      console.error("Error submitting module:", error);
      toast({
        variant: "destructive",
        title: "Error submitting module",
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Loading questions...</p>
      </div>
    );
  }

  if (!questions?.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>No questions available for this module.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const hasAnsweredCurrent = answers[currentQuestion.id] !== undefined;

  return (
    <div className="space-y-6">
      <TestHeader
        moduleName={moduleProgress.module.name}
        timeLeft={timeLeft}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
      />

      <QuestionCard
        question={currentQuestion}
        selectedAnswer={answers[currentQuestion.id] || null}
        isFlagged={flagged[currentQuestion.id] || false}
        onAnswerSelect={(answer) => handleAnswer(currentQuestion.id, answer)}
        onToggleFlag={() => toggleFlag(currentQuestion.id)}
        showFeedback={false}
        moduleName={moduleProgress.module.name}
        questions={questions}
        currentIndex={currentIndex}
        answers={answers}
        flagged={flagged}
        onQuestionSelect={setCurrentIndex}
      />

      <QuestionNavigation
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        hasAnswered={hasAnsweredCurrent}
        onPrevious={() => !isFirstQuestion && setCurrentIndex(currentIndex - 1)}
        onNext={() => !isLastQuestion && setCurrentIndex(currentIndex + 1)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}