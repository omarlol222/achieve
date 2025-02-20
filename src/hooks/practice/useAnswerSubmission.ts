
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PracticeQuestion } from "./types";

export function useAnswerSubmission(
  sessionId: string | undefined,
  userId: string | undefined,
  setStreak: (streak: number) => void,
  incrementQuestionsAnswered: () => void,
  setShowFeedback: (show: boolean) => void,
  setSelectedAnswer: (answer: number | null) => void,
  getNextQuestion: () => Promise<void>,
  questionsAnswered: number,
  totalQuestions: number
) {
  const navigate = useNavigate();
  const { toast } = useToast();

  return useCallback(async (
    selectedAnswer: number | null,
    currentQuestion: PracticeQuestion | null
  ) => {
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

      const { error: answerError } = await supabase
        .from("practice_answers")
        .insert({
          session_id: sessionId,
          question_id: currentQuestion.id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          user_id: userId,
          subtopic_id: currentQuestion.subtopic_id
        });

      if (answerError) throw answerError;

      const { data: progress } = await supabase
        .from("user_subtopic_progress")
        .select('streak_count')
        .eq("user_id", userId)
        .eq("subtopic_id", currentQuestion.subtopic_id)
        .single();

      setStreak(progress?.streak_count || 0);
      incrementQuestionsAnswered();
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
  }, [
    sessionId,
    userId,
    setStreak,
    incrementQuestionsAnswered,
    setShowFeedback,
    setSelectedAnswer,
    getNextQuestion,
    questionsAnswered,
    totalQuestions,
    navigate,
    toast
  ]);
}
