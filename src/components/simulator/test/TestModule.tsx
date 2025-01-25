import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionContent } from "@/components/practice/QuestionContent";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function TestModule({ 
  currentModuleIndex,
  onAnswer,
  answers,
  onNext,
  onFinish,
  isLastQuestion,
  questions,
  currentQuestionIndex,
  loading,
  error,
  setCurrentQuestionIndex,
  saveProgress
}: {
  currentModuleIndex: number;
  onAnswer: (questionId: string, answer: number) => void;
  answers: Record<string, number>;
  onNext: () => void;
  onFinish: () => void;
  isLastQuestion: boolean;
  questions: any[];
  currentQuestionIndex: number;
  loading: boolean;
  error: string | null;
  setCurrentQuestionIndex: (index: number) => void;
  saveProgress: () => Promise<void>;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentQuestion = questions[currentQuestionIndex];
  const hasAnsweredCurrent = currentQuestion && answers[currentQuestion.id] !== undefined;

  // Auto-save progress when navigating between questions
  useEffect(() => {
    if (hasAnsweredCurrent) {
      saveProgress();
    }
  }, [currentQuestionIndex, hasAnsweredCurrent]);

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = async () => {
    if (!hasAnsweredCurrent) {
      toast({
        title: "Please answer the question",
        description: "You must select an answer before proceeding",
        variant: "destructive"
      });
      return;
    }

    await saveProgress();
    
    if (isLastQuestion) {
      onFinish();
    } else {
      onNext();
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
          {hasAnsweredCurrent && (
            <Button 
              onClick={handleNext}
              className={isLastQuestion ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"}
            >
              {isLastQuestion ? "Finish Module" : "Next Question"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}