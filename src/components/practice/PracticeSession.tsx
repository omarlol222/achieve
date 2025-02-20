
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuestionContent } from "./QuestionContent";
import { useToast } from "@/hooks/use-toast";
import { usePracticeQuestions } from "@/hooks/usePracticeQuestions";
import { Progress } from "@/components/ui/progress";
import { usePracticeStore } from "@/store/usePracticeStore";

export function PracticeSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    selectedAnswer,
    showFeedback,
    actions: {
      setSelectedAnswer,
      setShowFeedback
    }
  } = usePracticeStore();

  const {
    currentQuestion,
    questionsAnswered,
    totalQuestions,
    getNextQuestion,
    isComplete
  } = usePracticeQuestions(sessionId);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to continue practice.",
          variant: "destructive",
        });
        navigate("/signin");
        return;
      }
      setUserId(session.user.id);
    };

    checkAuth();
  }, [navigate, toast]);

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentQuestion || !sessionId || !userId || isSubmitting) {
      toast({
        title: "Error",
        description: "Please select an answer and ensure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const isCorrect = selectedAnswer === currentQuestion.correct_answer;
      
      // Update streak and consecutive mistakes
      let newStreak = isCorrect ? currentStreak + 1 : 0;
      let newConsecutiveMistakes = isCorrect ? 0 : consecutiveMistakes + 1;
      
      setCurrentStreak(newStreak);
      setConsecutiveMistakes(newConsecutiveMistakes);

      // Update session streak
      const { error: streakError } = await supabase
        .from("practice_sessions")
        .update({ current_streak: newStreak })
        .eq("id", sessionId);

      if (streakError) {
        console.error("Error updating streak:", streakError);
        throw streakError;
      }

      // Record the answer with new point system data
      const { error: answerError } = await supabase
        .from("practice_answers")
        .insert({
          session_id: sessionId,
          question_id: currentQuestion.id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          user_id: userId,
          subtopic_id: currentQuestion.subtopic_id,
          difficulty_used: currentQuestion.difficulty || 'Easy',
          streak_at_answer: newStreak,
          consecutive_mistakes: newConsecutiveMistakes
        });

      if (answerError) {
        console.error("Error inserting answer:", answerError);
        throw answerError;
      }

      setShowFeedback(true);

      // Only complete the session after showing feedback for the last question
      setTimeout(async () => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        
        if (questionsAnswered >= totalQuestions - 1) {
          try {
            // Complete the session to trigger point calculation
            const { error: sessionError } = await supabase
              .from("practice_sessions")
              .update({ 
                status: 'completed',
                completed_at: new Date().toISOString(),
                questions_answered: totalQuestions
              })
              .eq("id", sessionId);

            if (sessionError) {
              console.error("Error completing session:", sessionError);
              throw sessionError;
            }

            // Navigate to results after ensuring session is completed
            navigate(`/gat/practice/results/${sessionId}`);
          } catch (error: any) {
            console.error("Error completing session:", error);
            toast({
              title: "Error completing session",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          getNextQuestion();
        }
        setIsSubmitting(false);
      }, 2000);

    } catch (error: any) {
      setIsSubmitting(false);
      console.error("Error submitting answer:", error);
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
          <p className="text-sm text-gray-500">Question {questionsAnswered + 1} of {totalQuestions}</p>
          <Progress value={((questionsAnswered + 1) / totalQuestions) * 100} className="w-[200px]" />
        </div>
        <div className="text-sm text-gray-500">
          Current Streak: {currentStreak}
        </div>
      </div>

      <Card className="p-6">
        <QuestionContent
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          showFeedback={showFeedback}
          onAnswerSelect={setSelectedAnswer}
          questionNumber={questionsAnswered + 1}
          totalQuestions={totalQuestions}
        />
        
        <div className="mt-6 flex justify-end">
          <Button
            size="lg"
            onClick={handleAnswerSubmit}
            disabled={selectedAnswer === null || showFeedback || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Answer"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
