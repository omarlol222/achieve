import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuestionContent } from "@/components/practice/QuestionContent";
import { PracticeResults } from "@/components/practice/PracticeResults";
import { handleQuestionProgress } from "./utils/progressUtils";
import { useToast } from "@/hooks/use-toast";
import { usePracticeQuestions } from "@/hooks/usePracticeQuestions";
import type { PracticeState } from "@/types/practice";

const PracticeTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [pointsChange, setPointsChange] = useState<number>(0);

  // Extract and validate state parameters
  const state = location.state as PracticeState | null;

  // If state is missing or invalid, show error and redirect
  if (!state?.topicId) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Missing required practice parameters. Please try again.",
    });
    navigate("/practice");
    return null;
  }

  const { topicId, difficulty, questionCount = 10 } = state;

  const { data: questions, isLoading } = usePracticeQuestions(topicId, difficulty, questionCount);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <p>Loading questions...</p>
      </div>
    );
  }

  if (!questions?.length) {
    return (
      <div className="min-h-screen bg-white p-8 flex flex-col items-center justify-center gap-4">
        <p>No questions available for this topic.</p>
        <Button onClick={() => navigate("/practice")}>Back to Practice</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnsweredCurrent = answers[currentQuestion.id] !== undefined;

  const handleAnswer = async (answer: number) => {
    const isCorrect = answer === currentQuestion.correct_answer;
    
    try {
      const result = await handleQuestionProgress(currentQuestion.topic_id, isCorrect);
      if (result.pointsChange !== undefined) {
        setPointsChange(prev => prev + result.pointsChange);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
    
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleFinish = () => {
    setShowResults(true);
  };

  const calculateResults = () => {
    const totalCorrect = Object.entries(answers).filter(
      ([questionId, answer]) => {
        const question = questions.find((q) => q.id === questionId);
        return question?.correct_answer === answer;
      }
    ).length;

    return {
      totalCorrect,
      totalQuestions: questions.length,
    };
  };

  const results = calculateResults();

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Practice Test</h1>
          <div className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        <QuestionContent
          question={currentQuestion}
          selectedAnswer={answers[currentQuestion.id] || null}
          showFeedback={answers[currentQuestion.id] !== undefined}
          onAnswerSelect={handleAnswer}
        />

        <div className="flex justify-center gap-4">
          {hasAnsweredCurrent && !isLastQuestion && (
            <Button 
              onClick={handleNext}
              className="bg-[#1B2B2B] hover:bg-[#2C3C3C]"
            >
              Next Question
            </Button>
          )}
          {isLastQuestion && hasAnsweredCurrent && (
            <Button 
              onClick={handleFinish}
              className="bg-[#1B2B2B] hover:bg-[#2C3C3C]"
            >
              Finish Practice
            </Button>
          )}
        </div>

        <PracticeResults
          open={showResults}
          onOpenChange={setShowResults}
          totalCorrect={results.totalCorrect}
          totalQuestions={results.totalQuestions}
          pointsChange={pointsChange}
        />
      </div>
    </div>
  );
};

export default PracticeTest;