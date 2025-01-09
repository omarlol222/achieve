import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuestionContent } from "@/components/practice/QuestionContent";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain } from "lucide-react";
import { handleQuestionProgress } from "./utils/progressUtils";
import { useToast } from "@/hooks/use-toast";

type Question = {
  id: string;
  question_text: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correct_answer: number;
  explanation?: string;
  question_type: string;
  comparison_value1?: string;
  comparison_value2?: string;
  image_url?: string;
  topic_id: string;
};

const PracticeTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);

  // Extract and validate state parameters
  const state = location.state as { topicId?: string; difficulty?: string; questionCount?: number } | null;

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

  const { data: questions, isLoading } = useQuery({
    queryKey: ["practice-questions", topicId, difficulty],
    queryFn: async () => {
      let query = supabase
        .from("questions")
        .select("*")
        .eq("topic_id", topicId);

      if (difficulty && difficulty !== "all") {
        query = query.eq("difficulty", difficulty);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data
        .sort(() => Math.random() - 0.5)
        .slice(0, questionCount);
    },
    retry: false,
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load questions. Please try again.",
      });
      navigate("/practice");
    },
  });

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

  const handleAnswer = async (answer: number) => {
    const isCorrect = answer === currentQuestion.correct_answer;
    await handleQuestionProgress(currentQuestion.topic_id, isCorrect);
    
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));

    // Move to next question or show results if it's the last question
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 1000);
    } else {
      setTimeout(() => {
        setShowResults(true);
      }, 1000);
    }
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
      percentage: (totalCorrect / questions.length) * 100,
    };
  };

  const handleStartNew = () => {
    navigate("/practice");
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

        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-3 text-2xl">
                <Brain className="h-8 w-8 text-[#1B2B2B]" />
                Practice Results
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-semibold">
                    Overall Score: {results.percentage.toFixed(1)}%
                  </h2>
                  <p className="text-lg">
                    {results.totalCorrect} correct out of {results.totalQuestions} questions
                  </p>
                </div>
              </Card>

              <div className="flex justify-center gap-4">
                <Button 
                  onClick={handleStartNew}
                  className="bg-[#1B2B2B] hover:bg-[#2C3C3C]"
                >
                  Start New Practice
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/gat")}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PracticeTest;