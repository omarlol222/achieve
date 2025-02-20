
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

  // Get session details to know total questions and subject
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
    if (!sessionId || !session?.subject) return;

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

      // First get the subject ID
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", session.subject)
        .maybeSingle();

      if (subjectError) throw subjectError;
      if (!subjectData) {
        throw new Error(`Subject "${session.subject}" not found`);
      }

      // Get all topics for the selected subject
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("id")
        .eq("subject_id", subjectData.id);

      if (topicsError) throw topicsError;
      if (!topicsData || topicsData.length === 0) {
        throw new Error(`No topics found for subject "${session.subject}"`);
      }

      const topicIds = topicsData.map(t => t.id);

      // Get already answered question IDs
      const { data: answeredQuestions } = await supabase
        .from("practice_answers")
        .select("question_id")
        .eq("session_id", sessionId);

      const answeredIds = answeredQuestions?.map(a => a.question_id) || [];

      // Get a random question of appropriate difficulty for any topic in the subject
      let query = supabase
        .from("questions")
        .select("*")
        .eq("difficulty", currentDifficulty)
        .in("topic_id", topicIds);

      // Only add the not-in filter if there are answered questions
      if (answeredIds.length > 0) {
        query = query.not('id', 'in', `(${answeredIds.join(',')})`);
      }

      const { data: question, error } = await query
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (!question) {
        // If no questions available at current difficulty, try easier ones
        const fallbackDifficulty = currentDifficulty === 'Hard' ? 'Moderate' : 'Easy';
        let fallbackQuery = supabase
          .from("questions")
          .select("*")
          .eq("difficulty", fallbackDifficulty)
          .in("topic_id", topicIds);

        // Only add the not-in filter if there are answered questions
        if (answeredIds.length > 0) {
          fallbackQuery = fallbackQuery.not('id', 'in', `(${answeredIds.join(',')})`);
        }

        const { data: fallbackQuestion, error: fallbackError } = await fallbackQuery
          .limit(1)
          .maybeSingle();

        if (fallbackError) throw fallbackError;
        if (!fallbackQuestion) {
          toast({
            title: "No more questions available",
            description: "You've completed all available questions at this difficulty level.",
            variant: "destructive",
          });
          return;
        }
        setCurrentQuestion(fallbackQuestion as PracticeQuestion);
      } else {
        setCurrentQuestion(question as PracticeQuestion);
      }
      
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
