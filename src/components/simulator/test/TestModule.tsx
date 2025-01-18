import { useEffect } from "react";
import { useQuestionManagement } from "./hooks/useQuestionManagement";
import { QuestionContent } from "@/components/practice/QuestionContent";
import { Button } from "@/components/ui/button";

export function TestModule({ 
  currentModuleIndex,
  onAnswer,
  answers,
  onNext,
  onFinish,
  isLastQuestion 
}: {
  currentModuleIndex: number;
  onAnswer: (questionId: string, answer: number) => void;
  answers: Record<string, number>;
  onNext: () => void;
  onFinish: () => void;
  isLastQuestion: boolean;
}) {
  const { 
    questions, 
    currentQuestionIndex, 
    setCurrentQuestionIndex,
    loading,
    error 
  } = useQuestionManagement(currentModuleIndex);

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnsweredCurrent = currentQuestion && answers[currentQuestion.id] !== undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">No questions available for this module.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <QuestionContent
        question={currentQuestion}
        selectedAnswer={answers[currentQuestion.id] || null}
        onAnswerSelect={(answer) => onAnswer(currentQuestion.id, answer)}
        showFeedback={false}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />

      <div className="flex justify-end space-x-4">
        {hasAnsweredCurrent && !isLastQuestion && (
          <Button onClick={onNext}>Next Question</Button>
        )}
        {hasAnsweredCurrent && isLastQuestion && (
          <Button onClick={onFinish}>Finish Module</Button>
        )}
      </div>
    </div>
  );
}