
import { useEffect } from "react";
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

  const {
    selectedAnswer,
    streak,
    showFeedback,
    actions: {
      setSelectedAnswer,
      setStreak,
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

  const calculatePoints = (isCorrect: boolean, difficulty: string, currentStreak: number) => {
    if (!isCorrect) return 0;
    
    let basePoints = 0;
    switch (difficulty) {
      case 'Easy':
        basePoints = 5;
        break;
      case 'Moderate':
        basePoints = 10;
        break;
      case 'Hard':
        basePoints = 15;
        break;
      default:
        basePoints = 5;
    }

    const streakBonus = currentStreak >= 3 ? Math.min(currentStreak - 2, 3) : 0;
    
    return basePoints + streakBonus;
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentQuestion || !sessionId || !userId) {
      toast({
        title: "Error",
        description: "Please select an answer and ensure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    try {
      const isCorrect = selectedAnswer === currentQuestion.correct_answer;
      
      const newStreak = isCorrect ? streak + 1 : 0;
      setStreak(newStreak);

      const pointsEarned = calculatePoints(isCorrect, currentQuestion.difficulty, streak);

      // Record the answer
      const { error: answerError } = await supabase
        .from("practice_answers")
        .insert({
          session_id: sessionId,
          question_id: currentQuestion.id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          streak_at_answer: streak,
          user_id: userId,
          points_earned: pointsEarned,
          subtopic_id: currentQuestion.subtopic_id
        });

      if (answerError) throw answerError;

      // Update user_subtopic_progress
      if (currentQuestion.subtopic_id) {
        const { error: progressError } = await supabase
          .from("user_subtopic_progress")
          .upsert({
            user_id: userId,
            subtopic_id: currentQuestion.subtopic_id,
            current_score: pointsEarned,
            last_practiced: new Date().toISOString()
          }, {
            onConflict: 'user_id,subtopic_id'
          });

        if (progressError) throw progressError;
      }

      setShowFeedback(true);

      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        
        if (questionsAnswered >= totalQuestions) {
          navigate(`/gat/practice/results/${sessionId}`);
        } else {
          getNextQuestion();
        }
      }, 2000);

    } catch (error: any) {
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
