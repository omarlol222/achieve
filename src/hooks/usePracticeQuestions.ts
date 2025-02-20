
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
      // Get answered questions for this session
      const { data: answersData, error: answersError } = await supabase
        .from("practice_answers")
        .select("question_id")
        .eq("session_id", sessionId);

      if (answersError) throw answersError;

      const answeredIds = (answersData || []).map(a => a.question_id);
      const currentAnsweredCount = answeredIds.length;
      setQuestionsAnswered(currentAnsweredCount + 1);

      // Check if we've completed all questions
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

      // Get subject ID
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", session.subject)
        .single();

      if (subjectError) throw subjectError;
      if (!subjectData) throw new Error(`Subject "${session.subject}" not found`);

      // Get topic IDs for the subject
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("id")
        .eq("subject_id", subjectData.id);

      if (topicsError) throw topicsError;
      if (!topicsData || topicsData.length === 0) {
        throw new Error(`No topics found for subject "${session.subject}"`);
      }

      const topicIds = topicsData.map(t => t.id);

      // Build the base query
      let query = supabase
        .from('questions')
        .select('*')
        .eq('difficulty', currentDifficulty)
        .in('topic_id', topicIds)
        .order('random()')
        .limit(1);

      // Only add the not.in filter if there are answered questions
      if (answeredIds.length > 0) {
        query = query.not('id', 'in', `(${answeredIds.join(',')})`);
      }

      // Execute the query
      const { data: questions, error: questionsError } = await query;

      if (questionsError) throw questionsError;

      if (!questions || questions.length === 0) {
        // Try fallback difficulty if no questions found
        const fallbackDifficulty = currentDifficulty === 'Hard' ? 'Moderate' : 'Easy';
        
        let fallbackQuery = supabase
          .from('questions')
          .select('*')
          .eq('difficulty', fallbackDifficulty)
          .in('topic_id', topicIds)
          .order('random()')
          .limit(1);

        if (answeredIds.length > 0) {
          fallbackQuery = fallbackQuery.not('id', 'in', `(${answeredIds.join(',')})`);
        }

        const { data: fallbackQuestions, error: fallbackError } = await fallbackQuery;

        if (fallbackError) throw fallbackError;
        if (!fallbackQuestions || fallbackQuestions.length === 0) {
          toast({
            title: "No more questions available",
            description: "You've completed all available questions at this difficulty level.",
            variant: "destructive",
          });
          return;
        }
        setCurrentQuestion(fallbackQuestions[0] as PracticeQuestion);
        setCurrentDifficulty(fallbackDifficulty);
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
