
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
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!sessionId
  });

  // Get next question based on current performance
  const getNextQuestion = async () => {
    if (!sessionId || !session?.subject) return;

    try {
      // Get the current count of answered questions for this session
      const { count } = await supabase
        .from("practice_answers")
        .select("*", { count: 'exact', head: true })
        .eq("session_id", sessionId);

      const currentAnsweredCount = count || 0;
      setQuestionsAnswered(currentAnsweredCount + 1);

      // Check if we've reached the total questions limit
      if (session.total_questions && currentAnsweredCount >= session.total_questions) {
        // Update session status to completed
        await supabase
          .from("practice_sessions")
          .update({ status: 'completed' })
          .eq("id", sessionId);
        setCurrentQuestion(null);
        return;
      }

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

      // Get the subject ID
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("id")
        .eq("name", session.subject)
        .single();

      if (!subjectData) {
        throw new Error(`Subject "${session.subject}" not found`);
      }

      // Get all topics for the selected subject
      const { data: topicsData } = await supabase
        .from("topics")
        .select("id")
        .eq("subject_id", subjectData.id);

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

      // Get a random question of appropriate difficulty
      const { data: questions, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("difficulty", currentDifficulty)
        .in("topic_id", topicIds)
        .not("id", "in", answeredIds.length > 0 ? `(${answeredIds.join(',')})` : "")
        .limit(1);

      if (questionsError) throw questionsError;

      if (!questions || questions.length === 0) {
        // If no questions available at current difficulty, try easier ones
        const fallbackDifficulty = currentDifficulty === 'Hard' ? 'Moderate' : 'Easy';
        const { data: fallbackQuestions, error: fallbackError } = await supabase
          .from("questions")
          .select("*")
          .eq("difficulty", fallbackDifficulty)
          .in("topic_id", topicIds)
          .not("id", "in", answeredIds.length > 0 ? `(${answeredIds.join(',')})` : "")
          .limit(1);

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

  // Get first question when session starts
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
