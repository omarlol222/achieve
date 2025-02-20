
import { useEffect, useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type PracticeQuestion = {
  id: string;
  question_text: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correct_answer: number;
  difficulty: string;
  subtopic_id: string;
  image_url?: string;
  explanation?: string;
  explanation_image_url?: string;
};

export function usePracticeQuestions(sessionId: string | undefined) {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Fetch session details
  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      const { data: session } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (session) {
        setTotalQuestions(session.total_questions);
        setQuestionsAnswered(session.questions_answered);
        setIsComplete(session.status === 'completed');
      }
    };

    fetchSession();
  }, [sessionId]);

  const getNextQuestion = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Get answered questions for this session
      const { data: answeredQuestions } = await supabase
        .from("practice_answers")
        .select("question_id")
        .eq("session_id", sessionId);

      const answeredIds = answeredQuestions?.map(q => q.question_id) || [];

      // Get a random unanswered question
      const { data: questions } = await supabase
        .from("questions")
        .select("*")
        .not("id", "in", `(${answeredIds.join(",")})`)
        .limit(1)
        .single();

      if (questions) {
        setCurrentQuestion(questions);
      } else {
        toast({
          title: "No more questions",
          description: "You've answered all available questions.",
          variant: "destructive",
        });
        setIsComplete(true);
      }
    } catch (error: any) {
      console.error("Error fetching next question:", error);
      toast({
        title: "Error fetching question",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [sessionId, toast]);

  // Load first question
  useEffect(() => {
    if (sessionId && !currentQuestion && !isComplete) {
      getNextQuestion();
    }
  }, [sessionId, currentQuestion, isComplete, getNextQuestion]);

  return {
    currentQuestion,
    questionsAnswered,
    totalQuestions,
    getNextQuestion,
    isComplete
  };
}
