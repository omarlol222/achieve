
import { useState, useEffect, useCallback } from "react";
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
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [subtopicAttempts, setSubtopicAttempts] = useState<Record<string, number>>({});
  const [consecutiveMistakes, setConsecutiveMistakes] = useState<Record<string, number>>({});

  const {
    currentQuestion,
    questionsAnswered,
    totalQuestions,
    getNextQuestion,
    isComplete,
    setQuestionsAnswered
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

  useEffect(() => {
    if (sessionId) {
      const loadSessionData = async () => {
        const { data: session } = await supabase
          .from("practice_sessions")
          .select("subtopic_attempts")
          .eq("id", sessionId)
          .single();

        if (session?.subtopic_attempts) {
          const attempts = session.subtopic_attempts as Record<string, number>;
          setSubtopicAttempts(attempts);
        }
      };
      loadSessionData();
    }
  }, [sessionId]);

  const handleAnswerSubmit = useCallback(async () => {
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
      const newQuestionsAnswered = questionsAnswered + 1;
      const subtopicId = currentQuestion.subtopic_id;

      const currentAttempts = subtopicAttempts[subtopicId] || 0;
      const newAttempts = { ...subtopicAttempts, [subtopicId]: currentAttempts + 1 };
      setSubtopicAttempts(newAttempts);

      const currentMistakes = consecutiveMistakes[subtopicId] || 0;
      const newMistakes = { ...consecutiveMistakes };
      if (!isCorrect) {
        newMistakes[subtopicId] = currentMistakes + 1;
      } else {
        newMistakes[subtopicId] = 0;
      }
      setConsecutiveMistakes(newMistakes);

      // Insert with all necessary fields for the trigger function
      const { error: answerError } = await supabase
        .from("practice_answers")
        .insert({
          session_id: sessionId,
          question_id: currentQuestion.id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          user_id: userId,
          subtopic_id: subtopicId,
          difficulty_used: currentQuestion.difficulty || 'Easy',
          attempt_number: currentAttempts + 1,
          consecutive_mistakes: newMistakes[subtopicId]
        });

      if (answerError) throw answerError;

      // Update session
      const { error: sessionError } = await supabase
        .from("practice_sessions")
        .update({
          questions_answered: newQuestionsAnswered,
          status: newQuestionsAnswered >= totalQuestions ? 'completed' : 'in_progress',
          subtopic_attempts: newAttempts,
          current_streak: isCorrect ? (questionsAnswered + 1) : 0
        })
        .eq("id", sessionId);

      if (sessionError) throw sessionError;

      setQuestionsAnswered(newQuestionsAnswered);
      setShowFeedback(true);

      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        
        if (newQuestionsAnswered >= totalQuestions) {
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
  }, [selectedAnswer, currentQuestion, sessionId, userId, questionsAnswered, totalQuestions, navigate, getNextQuestion, toast, setQuestionsAnswered, subtopicAttempts, consecutiveMistakes]);

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
            disabled={selectedAnswer === null || showFeedback}
          >
            Submit Answer
          </Button>
        </div>
      </Card>
    </div>
  );
}
