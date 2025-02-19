
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuestionContent } from "./QuestionContent";
import { useToast } from "@/hooks/use-toast";
import { usePracticeQuestions } from "@/hooks/usePracticeQuestions";
import { Progress } from "@/components/ui/progress";

export function PracticeSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const {
    currentQuestion,
    questionsAnswered,
    totalQuestions,
    getNextQuestion,
    isComplete
  } = usePracticeQuestions(sessionId);

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentQuestion || !sessionId) return;

    try {
      const isCorrect = selectedAnswer === currentQuestion.correct_answer;
      
      // Update streak
      const newStreak = isCorrect ? streak + 1 : 0;
      setStreak(newStreak);

      // Record answer
      await supabase.from("practice_answers").insert({
        session_id: sessionId,
        question_id: currentQuestion.id,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        streak_at_answer: streak,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

      // Update session progress
      await supabase
        .from("practice_sessions")
        .update({
          questions_answered: questionsAnswered,
          current_streak: newStreak,
          status: isComplete ? 'completed' : 'in_progress',
          completed_at: isComplete ? new Date().toISOString() : null
        })
        .eq("id", sessionId);

      setShowFeedback(true);

      // Show feedback for 2 seconds before moving to next question
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        
        if (isComplete) {
          navigate(`/gat/practice/results/${sessionId}`);
        } else {
          getNextQuestion();
        }
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Error submitting answer",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Question {questionsAnswered} of {totalQuestions}</p>
          <Progress value={(questionsAnswered / totalQuestions) * 100} className="w-[200px]" />
        </div>
        
        {streak >= 3 && (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            🔥 Streak: {streak}
          </div>
        )}
      </div>

      <Card className="p-6">
        <QuestionContent
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          showFeedback={showFeedback}
          onAnswerSelect={setSelectedAnswer}
          questionNumber={questionsAnswered}
          totalQuestions={totalQuestions}
        />
        
        <div className="mt-6 flex justify-end">
          <Button
            size="lg"
            onClick={handleAnswerSubmit}
            disabled={selectedAnswer === null || showFeedback}
          >
            Submit Answer
          </Button>
        </div>
      </Card>
    </div>
  );
}
