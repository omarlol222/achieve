
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePracticeStore } from "@/store/usePracticeStore";
import { useSession } from "./practice/useSession";
import { useSubtopics } from "./practice/useSubtopics";
import { useAnsweredQuestions } from "./practice/useAnsweredQuestions";
import { fetchQuestionsForSubtopic, fetchFallbackQuestions } from "./practice/useQuestionFetcher";

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

  const { data: session } = useSession(sessionId);
  const { data: subtopicIds = [] } = useSubtopics(session?.subject);
  const { data: answeredIds = [] } = useAnsweredQuestions(sessionId);

  console.log("Session data:", session);
  console.log("Subtopic IDs:", subtopicIds);
  console.log("Answered IDs:", answeredIds);

  const getNextQuestion = async () => {
    if (!sessionId || !session?.subject) {
      console.log("Missing sessionId or subject:", { sessionId, subject: session?.subject });
      return;
    }

    try {
      const currentAnsweredCount = answeredIds.length;
      setQuestionsAnswered(currentAnsweredCount + 1);

      // Check if we've completed all questions
      if (session.total_questions && currentAnsweredCount >= session.total_questions) {
        console.log("Session completed", { currentAnsweredCount, totalQuestions: session.total_questions });
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

      // Get current difficulty levels for each subtopic
      const { data: progressData } = await supabase
        .from('user_subtopic_progress')
        .select('subtopic_id, difficulty_level')
        .in('subtopic_id', subtopicIds)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      console.log("Progress data:", progressData);

      const subtopicDifficulties = new Map(
        progressData?.map(p => [p.subtopic_id, isValidDifficulty(p.difficulty_level) ? p.difficulty_level : 'Easy']) || []
      );

      // Fetch questions for each subtopic at their current difficulty level
      let availableQuestions: PracticeQuestion[] = [];
      
      for (const subtopicId of subtopicIds) {
        const difficulty = subtopicDifficulties.get(subtopicId) || 'Easy';
        console.log("Fetching questions for subtopic:", { subtopicId, difficulty });
        const questions = await fetchQuestionsForSubtopic(subtopicId, difficulty, answeredIds);
        console.log("Questions fetched:", questions.length);
        availableQuestions.push(...questions);
      }

      console.log("Total available questions:", availableQuestions.length);

      if (availableQuestions.length === 0) {
        // Fallback to questions of any difficulty if no questions at current difficulty
        console.log("No questions available, trying fallback");
        const fallbackQuestions = await fetchFallbackQuestions(subtopicIds, answeredIds);
        console.log("Fallback questions:", fallbackQuestions.length);

        if (!fallbackQuestions || fallbackQuestions.length === 0) {
          toast({
            title: "No more questions available",
            description: "You've completed all available questions.",
            variant: "destructive",
          });
          return;
        }
        
        availableQuestions = fallbackQuestions;
      }

      // Select a random question from available questions
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      const selectedQuestion = availableQuestions[randomIndex];
      console.log("Selected question:", selectedQuestion?.id);
      setCurrentQuestion(selectedQuestion);

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
      console.log("Initializing questions");
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
