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
import { Info, ArrowRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PracticeSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [showNextButton, setShowNextButton] = useState(false);

  const {
    selectedAnswer,
    showFeedback,
    actions: {
      setSelectedAnswer,
      setShowFeedback,
      setQuestionsAnswered
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
    if (sessionId) {
      setQuestionsAnswered(0);
    }
  }, [sessionId, setQuestionsAnswered]);

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

  const completeSession = async () => {
    if (!sessionId) return;

    try {
      console.log("Starting session completion...");
      
      const { error: completeError } = await supabase
        .from("practice_sessions")
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          questions_answered: totalQuestions,
          total_points: pointsEarned
        })
        .eq("id", sessionId)
        .select();

      if (completeError) {
        console.error("Complete session error:", completeError);
        throw completeError;
      }

      console.log("Session completed successfully, navigating to results...");
      navigate(`/gat/practice/results/${sessionId}`);
    } catch (error: any) {
      console.error("Error in completeSession:", error);
      throw error;
    }
  };

  const calculatePointsForAnswer = (isCorrect: boolean, difficulty: string, streak: number) => {
    if (!isCorrect) return 0;
    
    let basePoints = 
      difficulty === 'Hard' ? 30 :
      difficulty === 'Moderate' ? 20 : 10;

    let multiplier = 
      streak >= 10 ? 2.0 :
      streak >= 5 ? 1.5 :
      streak >= 3 ? 1.2 : 1.0;

    return Math.round(basePoints * multiplier);
  };

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
      
      let newStreak = isCorrect ? currentStreak + 1 : 0;
      let newConsecutiveMistakes = isCorrect ? 0 : consecutiveMistakes + 1;
      
      const newPoints = calculatePointsForAnswer(
        isCorrect, 
        currentQuestion.difficulty || 'Easy',
        newStreak
      );
      
      setCurrentStreak(newStreak);
      setConsecutiveMistakes(newConsecutiveMistakes);
      setPointsEarned(prev => prev + newPoints);

      const { error: streakError } = await supabase
        .from("practice_sessions")
        .update({ 
          current_streak: newStreak,
          total_points: pointsEarned + newPoints
        })
        .eq("id", sessionId);

      if (streakError) throw streakError;

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
          consecutive_mistakes: newConsecutiveMistakes,
          points_earned: newPoints
        });

      if (answerError) throw answerError;

      setShowFeedback(true);
      setShowNextButton(true);
      setIsSubmitting(false);

    } catch (error: any) {
      setIsSubmitting(false);
      console.error("Error submitting answer:", error);
      toast({
        title: "Error submitting answer",
        description: "Failed to submit your answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setShowNextButton(false);
    
    if (questionsAnswered >= totalQuestions - 1) {
      completeSession();
    } else {
      getNextQuestion();
    }
  };

  const getPointsInfo = () => {
    if (!currentQuestion) return null;

    const basePoints = (() => {
      const difficulty = currentQuestion.difficulty || 'Easy';
      if (currentQuestion.question_type === 'analogy') {
        return difficulty === 'Hard' ? 9 : difficulty === 'Moderate' ? 6 : 3;
      } else if (currentQuestion.category === 'vocabulary' || currentQuestion.category === 'grammar') {
        return difficulty === 'Hard' ? 12 : difficulty === 'Moderate' ? 8 : 4;
      } else {
        return difficulty === 'Hard' ? 15 : difficulty === 'Moderate' ? 10 : 5;
      }
    })();

    const categoryMultiplier = currentQuestion.question_type === 'analogy' ? 0.7 :
      (currentQuestion.category === 'vocabulary' || currentQuestion.category === 'grammar') ? 0.9 : 1;

    return {
      basePoints,
      categoryMultiplier,
      potentialPoints: Math.floor(basePoints * categoryMultiplier)
    };
  };

  const pointsInfo = getPointsInfo();

  if (!currentQuestion && !isComplete) {
    return (
      <div className="container py-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="h-32 bg-gray-200 rounded max-w-2xl mx-auto"></div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="container py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Practice Complete!</h2>
        <p className="text-gray-600 mb-6">You've completed all questions in this session.</p>
        <Button onClick={() => navigate("/gat/english")}>
          Return to English Practice
        </Button>
      </div>
    );
  }

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
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1">
            <span role="img" aria-label="fire" className="text-xl">🔥</span>
            <span className="font-medium text-orange-600">{currentStreak}</span>
          </div>
          <div className="text-sm text-gray-500">
            Points: {pointsEarned}
          </div>
          {pointsInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-sm text-gray-500 cursor-help">
                    <Info className="h-4 w-4" />
                    Potential Points: {pointsInfo.potentialPoints}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-64">
                  <p>Base Points: {pointsInfo.basePoints}</p>
                  <p>Question Type: {currentQuestion?.question_type}</p>
                  {pointsInfo.categoryMultiplier !== 1 && (
                    <p>Category Multiplier: {pointsInfo.categoryMultiplier}x</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    {currentQuestion?.question_type === 'analogy' 
                      ? 'Analogy questions earn 30% fewer points'
                      : currentQuestion?.category === 'vocabulary' || currentQuestion?.category === 'grammar'
                      ? 'This question type earns 10% fewer points'
                      : 'Full points awarded for this question type'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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
        
        <div className="mt-6 flex justify-end gap-4">
          {showNextButton ? (
            <Button
              size="lg"
              onClick={handleNextQuestion}
              className="flex items-center gap-2"
            >
              Next Question
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleAnswerSubmit}
              disabled={selectedAnswer === null || showFeedback || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
