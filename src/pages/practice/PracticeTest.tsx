import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QuestionContent } from "@/components/practice/QuestionContent";
import { handleQuestionProgress } from "./utils/progressUtils";

type Question = {
  id: string;
  question_text: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correct_answer: number;
  topic_id: string;
  question_type: string;
  comparison_value1?: string;
  comparison_value2?: string;
  image_url?: string;
};

const PracticeTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showFeedback, setShowFeedback] = useState(false);

  const { topicId, difficulty, questionCount } = location.state || {};

  const { data: questions } = useQuery({
    queryKey: ["practice-questions", topicId, difficulty],
    queryFn: async () => {
      let query = supabase
        .from("questions")
        .select("*")
        .eq("topic_id", topicId);

      if (difficulty !== "all") {
        query = query.eq("difficulty", difficulty);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Shuffle and limit to requested question count
      return data
        .sort(() => Math.random() - 0.5)
        .slice(0, questionCount);
    },
  });

  const currentQuestion = questions?.[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (questions?.length || 1)) * 100;

  const handleAnswer = async (answer: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const isCorrect = answer === currentQuestion.correct_answer;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    try {
      await handleQuestionProgress(currentQuestion.topic_id, isCorrect);
    } catch (error: any) {
      console.error("Error updating progress:", error);
      toast({
        variant: "destructive",
        title: "Error updating progress",
        description: error.message,
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex === questions!.length - 1) {
      const results = questions!.map(q => ({
        questionId: q.id,
        topicId: q.topic_id,
        isCorrect: answers[q.id] === q.correct_answer
      }));

      navigate("/practice/results", {
        state: {
          results,
          totalQuestions: questions!.length,
        },
      });
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  if (!questions) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1B2B2B]">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h1>
          <Progress value={progress} className="w-64" />
        </div>

        <QuestionContent
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          showFeedback={showFeedback}
          onAnswerSelect={handleAnswer}
        />

        {showFeedback && (
          <Button
            className="w-full bg-[#1B2B2B] hover:bg-[#2C3C3C]"
            onClick={handleNext}
          >
            {currentQuestionIndex === questions.length - 1
              ? "See Results"
              : "Next Question"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PracticeTest;