import React from 'react';
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
    loading,
    error,
    setCurrentQuestionIndex
  } = useQuestionManagement(currentModuleIndex);

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnsweredCurrent = currentQuestion && answers[currentQuestion.id] !== undefined;

  console.log('Current answers:', answers);
  console.log('Current question ID:', currentQuestion?.id);
  console.log('Selected answer:', currentQuestion ? answers[currentQuestion.id] : null);

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

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
        selectedAnswer={currentQuestion ? answers[currentQuestion.id] : null}
        onAnswerSelect={(answer) => {
          console.log('Answer selected:', answer);
          if (currentQuestion) {
            onAnswer(currentQuestion.id, answer);
          }
        }}
        showFeedback={false}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
      />

      <div className="flex justify-between space-x-4">
        <Button 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          Previous Question
        </Button>

        <div className="flex space-x-4">
          {hasAnsweredCurrent && !isLastQuestion && (
            <Button 
              onClick={onNext}
              className="bg-primary hover:bg-primary/90"
            >
              Next Question
            </Button>
          )}
          {hasAnsweredCurrent && isLastQuestion && (
            <Button 
              onClick={onFinish}
              className="bg-green-600 hover:bg-green-700"
            >
              Finish Module
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}