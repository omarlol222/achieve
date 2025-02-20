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

  const { data: session } = useQuery({
    queryKey: ["practice-session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const { data, error } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!sessionId
  });

  const getNextQuestion = async () => {
    if (!sessionId || !session?.subject) return;

    try {
      const { data: answersData, count } = await supabase
        .from("practice_answers")
        .select("*", { count: 'exact' })
        .eq("session_id", sessionId);

      const currentAnsweredCount = count || 0;
      setQuestionsAnswered(currentAnsweredCount + 1);

      if (session.total_questions && currentAnsweredCount >= session.total_questions) {
        await supabase
          .from("practice_sessions")
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            questions_answered: currentAnsweredCount 
          })
          .eq("id", sessionId);
        setCurrentQuestion(null);
        return;
      }

      const { data: subjectData } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", session.subject)
        .single();

      if (!subjectData) throw new Error(`Subject "${session.subject}" not found`);

      const { data: topicsData } = await supabase
        .from("topics")
        .select("id")
        .eq("subject_id", subjectData.id);

      if (!topicsData || topicsData.length === 0) {
        throw new Error(`No topics found for subject "${session.subject}"`);
      }

      const topicIds = topicsData.map(t => t.id);
      const answeredIds = (answersData || []).map(a => a.question_id);

      const { data: questions, error: questionsError } = await supabase
        .rpc('get_random_unanswered_question', {
          p_difficulty: currentDifficulty,
          p_topic_ids: topicIds,
          p_answered_ids: answeredIds
        });

      if (questionsError) throw questionsError;

      if (!questions || questions.length === 0) {
        const fallbackDifficulty = currentDifficulty === 'Hard' ? 'Moderate' : 'Easy';
        
        const { data: fallbackQuestions, error: fallbackError } = await supabase
          .rpc('get_random_unanswered_question', {
            p_difficulty: fallbackDifficulty,
            p_topic_ids: topicIds,
            p_answered_ids: answeredIds
          });

        if (fallbackError) throw fallbackError;
        if (!fallbackQuestions || !fallbackQuestions[0]) {
          toast({
            title: "No more questions available",
            description: "You've completed all available questions at this difficulty level.",
            variant: "destructive",
          });
          return;
        }
        setCurrentQuestion(fallbackQuestions[0] as PracticeQuestion);
      } else {
        setCurrentQuestion(questions[0] as PracticeQuestion);
      }
    } catch (error: any) {
      console.error("Error fetching next question:", error);
      toast({
        title: "Error fetching question",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (session && !currentQuestion) {
      getNextQuestion();
    }
  }, [session]);

  const isComplete = session?.status === 'completed' || 
                    (session?.total_questions && questionsAnswered >= session.total_questions);

  return {
    currentQuestion,
    questionsAnswered,
    totalQuestions: session?.total_questions || 0,
    getNextQuestion,
    isComplete
  };
}
