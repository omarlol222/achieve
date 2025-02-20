
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePracticeStore } from "@/store/usePracticeStore";
import { useSession } from "./practice/useSession";
import { useSubtopics } from "./practice/useSubtopics";
import { useAnsweredQuestions } from "./practice/useAnsweredQuestions";
import { fetchQuestionsForSubtopic, fetchFallbackQuestions } from "./practice/useQuestionFetcher";
import { useAchievementNotification } from "@/components/achievements/AchievementNotification";

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
  const { showAchievementNotification } = useAchievementNotification();
  const { 
    currentQuestion,
    questionsAnswered,
    actions: { 
      setCurrentQuestion,
      setQuestionsAnswered,
      incrementQuestionsAnswered
    }
  } = usePracticeStore();

  const { data: session } = useSession(sessionId);
  const { data: subtopicIds = [] } = useSubtopics(session?.subject);
  const { data: answeredIds = [] } = useAnsweredQuestions(sessionId);

  useEffect(() => {
    if (!session?.user_id) return;

    const channel = supabase
      .channel('achievements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${session.user_id}`
        },
        async (payload) => {
          const { data: achievement } = await supabase
            .from('achievements')
            .select('*')
            .eq('id', payload.new.achievement_id)
            .single();

          if (achievement) {
            showAchievementNotification(achievement);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user_id, showAchievementNotification]);

  const completeSession = useCallback(async (currentAnsweredCount: number) => {
    if (!sessionId) return;
    
    const totalPoints = (session?.practice_answers || []).reduce(
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
  }, [sessionId, session?.practice_answers, setCurrentQuestion]);

  const getNextQuestion = useCallback(async () => {
    if (!sessionId || !session?.subject || subtopicIds.length === 0) {
      return;
    }

    try {
      // Increment the questions answered count here, before fetching the next question
      const currentAnsweredCount = answeredIds.length;
      incrementQuestionsAnswered();

      if (session.total_questions && currentAnsweredCount >= session.total_questions) {
        await completeSession(currentAnsweredCount);
        return;
      }

      const { data: progressData } = await supabase
        .from('user_subtopic_progress')
        .select('subtopic_id, difficulty_level')
        .in('subtopic_id', subtopicIds)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      const subtopicDifficulties = new Map(
        progressData?.map(p => [p.subtopic_id, isValidDifficulty(p.difficulty_level) ? p.difficulty_level : 'Easy']) || []
      );

      const questionPromises = subtopicIds.map(subtopicId => 
        fetchQuestionsForSubtopic(
          subtopicId,
          subtopicDifficulties.get(subtopicId) || 'Easy',
          answeredIds
        )
      );

      const questionsArrays = await Promise.all(questionPromises);
      let availableQuestions = questionsArrays.flat();

      if (availableQuestions.length === 0) {
        availableQuestions = await fetchFallbackQuestions(subtopicIds, answeredIds);

        if (availableQuestions.length === 0) {
          toast({
            title: "No more questions available",
            description: "You've completed all available questions.",
            variant: "destructive",
          });
          return;
        }
      }

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
  }, [sessionId, session, subtopicIds, answeredIds, setCurrentQuestion, incrementQuestionsAnswered, completeSession, toast]);

  useEffect(() => {
    if (session && !currentQuestion && subtopicIds.length > 0) {
      getNextQuestion();
    }
  }, [session, currentQuestion, subtopicIds, getNextQuestion]);

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
