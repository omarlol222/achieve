import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuestionContent } from "@/components/practice/QuestionContent";

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
};

const PracticeTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});

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

      return data
        .sort(() => Math.random() - 0.5)
        .slice(0, questionCount);
    },
  });

  if (!questions) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return <div>No questions available.</div>;
  }

  const handleAnswer = (answer: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

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

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <div className="space-x-2">
            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/practice")}
                disabled={!answers[currentQuestion.id]}
              >
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeTest;