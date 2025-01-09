import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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

  if (!questions) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return <div>No questions available.</div>;
  }

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: parseInt(value),
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowFeedback(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowFeedback(false);
    }
  };

  const handleShowFeedback = () => {
    setShowFeedback(true);
  };

  const isCorrect = answers[currentQuestion.id] === currentQuestion.correct_answer;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Practice Test</h1>
          <div className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="text-lg font-medium">{currentQuestion.question_text}</div>
            {currentQuestion.image_url && (
              <img
                src={currentQuestion.image_url}
                alt="Question"
                className="max-w-full h-auto rounded-lg"
              />
            )}
            <RadioGroup
              value={answers[currentQuestion.id]?.toString()}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {[1, 2, 3, 4].map((choiceNum) => (
                <div key={choiceNum} className="flex items-center space-x-2">
                  <RadioGroupItem value={choiceNum.toString()} id={`choice${choiceNum}`} />
                  <Label htmlFor={`choice${choiceNum}`}>
                    {currentQuestion[`choice${choiceNum}` as keyof Question]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {showFeedback && (
            <div
              className={`p-4 rounded-lg ${
                isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              <p className="font-medium">
                {isCorrect ? "Correct!" : "Incorrect."}
              </p>
              {currentQuestion.explanation && (
                <p className="mt-2">{currentQuestion.explanation}</p>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <div className="space-x-2">
              {!showFeedback && (
                <Button
                  variant="secondary"
                  onClick={handleShowFeedback}
                  disabled={!answers[currentQuestion.id]}
                >
                  Check Answer
                </Button>
              )}
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
        </Card>
      </div>
    </div>
  );
};

export default PracticeTest;