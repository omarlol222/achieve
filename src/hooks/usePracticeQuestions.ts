
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePracticeStore } from "@/store/usePracticeStore";

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
  subtopic_id?: string;
};

type DifficultyLevel = 'Easy' | 'Moderate' | 'Hard';

const isValidDifficulty = (difficulty: string | null | undefined): difficulty is DifficultyLevel => {
  return difficulty === 'Easy' || difficulty === 'Moderate' || difficulty === 'Hard';
};

export function usePracticeQuestions(sessionId: string | undefined) {
  const { toast } = useToast();
  const { 
    currentQuestion,
    questionsAnswered,
    actions: { 
      setCurrentQuestion,
      setQuestionsAnswered 
    }
  } = usePracticeStore();

  const { data: session } = useQuery({
    queryKey: ["practice-session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const { data, error } = await supabase
        .from("practice_sessions")
        .select(`
          *,
          practice_answers (
            points_earned
          )
        `)
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
        const totalPoints = (session.practice_answers || []).reduce(
          (sum: number, answer: any) => sum + (answer.points_earned || 0), 
          0
        );

        await supabase
          .from("practice_sessions")
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            questions_answered: currentAnsweredCount,
            total_points: totalPoints
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
        .select("id, subtopics(id)")
        .eq("subject_id", subjectData.id);

      if (topicsError) throw topicsError;
      if (!topicsData || topicsData.length === 0) {
        throw new Error(`No topics found for subject "${session.subject}"`);
      }

      // Get all subtopic IDs
      const subtopicIds = topicsData.flatMap(t => 
        (t.subtopics || []).map(st => st.id)
      ).filter(Boolean);

      // Get current difficulty levels for each subtopic
      const { data: progressData } = await supabase
        .from('user_subtopic_progress')
        .select('subtopic_id, difficulty_level')
        .in('subtopic_id', subtopicIds)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      const subtopicDifficulties = new Map(
        progressData?.map(p => [p.subtopic_id, isValidDifficulty(p.difficulty_level) ? p.difficulty_level : 'Easy']) || []
      );

      // Fetch questions for each subtopic at their current difficulty level
      let availableQuestions: PracticeQuestion[] = [];
      
      for (const subtopicId of subtopicIds) {
        const difficulty = subtopicDifficulties.get(subtopicId) || 'Easy';
        
        const query = supabase
          .from('questions')
          .select('*')
          .eq('subtopic_id', subtopicId)
          .eq('difficulty', difficulty);

        // Only add the not-in filter if there are answered questions
        if (answeredIds.length > 0) {
          query.not('id', 'in', answeredIds);
        }

        const { data: questions } = await query;

        if (questions) {
          availableQuestions.push(...questions as PracticeQuestion[]);
        }
      }

      if (availableQuestions.length === 0) {
        // Fallback to questions of any difficulty if no questions at current difficulty
        const query = supabase
          .from('questions')
          .select('*')
          .in('subtopic_id', subtopicIds)
          .limit(10);

        // Only add the not-in filter if there are answered questions
        if (answeredIds.length > 0) {
          query.not('id', 'in', answeredIds);
        }

        const { data: fallbackQuestions } = await query;

        if (!fallbackQuestions || fallbackQuestions.length === 0) {
          toast({
            title: "No more questions available",
            description: "You've completed all available questions.",
            variant: "destructive",
          });
          return;
        }
        
        availableQuestions = fallbackQuestions as PracticeQuestion[];
      }

      // Select a random question from available questions
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      setCurrentQuestion(availableQuestions[randomIndex]);

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
