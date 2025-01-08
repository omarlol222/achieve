import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

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
};

const PracticeTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showFeedback, setShowFeedback] = useState(false);

  const { subjectId, topicIds, difficulty, questionCount } = location.state || {};

  const { data: questions } = useQuery({
    queryKey: ["practice-questions", topicIds, difficulty, questionCount],
    queryFn: async () => {
      let query = supabase
        .from("questions")
        .select("*")
        .in("topic_id", topicIds)
        .limit(questionCount);

      if (difficulty !== "all") {
        query = query.eq("difficulty", difficulty);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.sort(() => Math.random() - 0.5);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existingProgress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("topic_id", currentQuestion.topic_id)
        .single();

      if (existingProgress) {
        await supabase
          .from("user_progress")
          .update({
            questions_attempted: existingProgress.questions_attempted + 1,
            questions_correct: existingProgress.questions_correct + (isCorrect ? 1 : 0),
            last_activity: new Date().toISOString(),
          })
          .eq("id", existingProgress.id);
      } else {
        await supabase
          .from("user_progress")
          .insert({
            user_id: user.id,
            topic_id: currentQuestion.topic_id,
            questions_attempted: 1,
            questions_correct: isCorrect ? 1 : 0,
          });
      }
    } catch (error: any) {
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

  const renderQuestionContent = () => {
    if (currentQuestion.question_type === 'comparison') {
      return (
        <div className="space-y-4">
          <p className="text-lg">{currentQuestion.question_text}</p>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="border-b p-2 text-center w-1/2 bg-gray-50">A</th>
                  <th className="border-b p-2 text-center w-1/2 bg-gray-50">B</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r p-4 text-center">{currentQuestion.comparison_value1}</td>
                  <td className="p-4 text-center">{currentQuestion.comparison_value2}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return <p className="text-lg">{currentQuestion.question_text}</p>;
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1B2B2B]">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h1>
          <Progress value={progress} className="w-64" />
        </div>

        <Card className="p-6 space-y-6">
          {renderQuestionContent()}

          <div className="space-y-4">
            {[1, 2, 3, 4].map((choice) => (
              <Button
                key={choice}
                variant={selectedAnswer === choice ? "default" : "outline"}
                className={`w-full justify-start h-auto p-4 ${
                  showFeedback
                    ? choice === currentQuestion?.correct_answer
                      ? "bg-green-100 hover:bg-green-100"
                      : choice === selectedAnswer
                      ? "bg-red-100 hover:bg-red-100"
                      : ""
                    : ""
                }`}
                onClick={() => handleAnswer(choice)}
              >
                {currentQuestion?.[`choice${choice}` as keyof Question]}
                {showFeedback && choice === currentQuestion?.correct_answer && (
                  <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                )}
                {showFeedback && choice === selectedAnswer && choice !== currentQuestion?.correct_answer && (
                  <XCircle className="ml-2 h-4 w-4 text-red-500" />
                )}
              </Button>
            ))}
          </div>

          {showFeedback && (
            <Button
              className="w-full bg-[#1B2B2B] hover:bg-[#2C3C3C]"
              onClick={handleNext}
            >
              {currentQuestionIndex === questions.length - 1 ? "See Results" : "Next Question"}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PracticeTest;