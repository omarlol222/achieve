
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type PracticeQuestion = {
  id: string;
  question_text: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correct_answer: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  image_url?: string;
  explanation?: string;
  explanation_image_url?: string;
  question_type: 'normal' | 'passage' | 'analogy' | 'comparison';
  passage_text?: string;
  comparison_value1?: string;
  comparison_value2?: string;
};

export function usePracticeQuestions(sessionId: string | undefined) {
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<'Easy' | 'Moderate' | 'Hard'>('Easy');
  const { toast } = useToast();

  // Get session details to know total questions
  const { data: session } = useQuery({
    queryKey: ["practice-session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const { data, error } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!sessionId
  });

  // Get next question based on current performance
  const getNextQuestion = async () => {
    if (!sessionId) return;

    try {
      // Get answers for this session to calculate performance
      const { data: answers } = await supabase
        .from("practice_answers")
        .select("is_correct")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(3);

      // Adjust difficulty based on recent performance
      if (answers && answers.length >= 3) {
        const recentCorrect = answers.filter(a => a.is_correct).length;
        if (recentCorrect >= 2 && currentDifficulty !== 'Hard') {
          setCurrentDifficulty(currentDifficulty === 'Easy' ? 'Moderate' : 'Hard');
        } else if (recentCorrect <= 1 && currentDifficulty !== 'Easy') {
          setCurrentDifficulty(currentDifficulty === 'Hard' ? 'Moderate' : 'Easy');
        }
      }

      // Get a random question of appropriate difficulty
      // that hasn't been answered in this session
      const { data: questions, error } = await supabase
        .from("questions")
        .select("*")
        .eq("difficulty", currentDifficulty)
        .not("id", "in", (
          await supabase
            .from("practice_answers")
            .select("question_id")
            .eq("session_id", sessionId)
        ).data?.map(a => a.question_id) || [])
        .limit(1)
        .single();

      if (error) throw error;
      setCurrentQuestion(questions);
      setQuestionsAnswered(prev => prev + 1);
    } catch (error: any) {
      console.error("Error fetching next question:", error);
      toast({
        title: "Error fetching question",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Get first question when session starts
  useEffect(() => {
    if (session && !currentQuestion) {
      getNextQuestion();
    }
  }, [session]);

  return {
    currentQuestion,
    questionsAnswered,
    totalQuestions: session?.total_questions || 0,
    getNextQuestion,
    isComplete: session?.status === 'completed' || 
                (session?.total_questions && questionsAnswered >= session.total_questions)
  };
}
