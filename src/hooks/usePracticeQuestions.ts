import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePracticeStore } from "@/store/usePracticeStore";
import { useSession } from "./practice/useSession";
import { useAnsweredQuestions } from "./practice/useAnsweredQuestions";
import { fetchQuestionsForSubtopic, fetchFallbackQuestions } from "./practice/useQuestionFetcher";
import { useAchievementNotification } from "@/components/achievements/AchievementNotification";
import { useQuery } from "@tanstack/react-query";

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

type SubtopicAttempts = {
  subtopics: string[];
};

type PracticeSession = {
  id: string;
  user_id: string;
  subject: string;
  total_questions: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  subtopic_attempts: SubtopicAttempts;
  questions_answered?: number;
};

export function usePracticeQuestions(sessionId: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showAchievementNotification } = useAchievementNotification();

  const { 
    currentQuestion,
    questionsAnswered,
    selectedAnswer,
    streak,
    showFeedback,
    actions: { 
      setCurrentQuestion,
      setQuestionsAnswered,
      incrementQuestionsAnswered,
      setSelectedAnswer,
      setStreak,
      setShowFeedback
    }
  } = usePracticeStore();

  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["practice-session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      
      const { data, error } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) {
        console.error("Error fetching session:", error);
        throw error;
      }

      console.log("Session data:", data);
      return data;
    },
    enabled: !!sessionId
  });

  const subtopicIds = (session?.subtopic_attempts as SubtopicAttempts)?.subtopics || [];
  
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

  const getNextQuestion = useCallback(async () => {
    if (!sessionId || !session?.subject || subtopicIds.length === 0) {
      console.log("Early return conditions:", {
        sessionId,
        subject: session?.subject,
        subtopicIdsLength: subtopicIds.length
      });
      return;
    }

    try {
      const { data: statisticsData } = await supabase
        .from('user_subtopic_statistics')
        .select('subtopic_id, accuracy')
        .in('subtopic_id', subtopicIds)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      const subtopicDifficulties = new Map(
        statisticsData?.map(stat => [
          stat.subtopic_id,
          stat.accuracy && stat.accuracy >= 0.8 ? 'Hard' :
          stat.accuracy && stat.accuracy >= 0.6 ? 'Moderate' : 'Easy'
        ]) || []
      );

      const questionPromises = subtopicIds.map(subtopicId => {
        const difficulty = subtopicDifficulties.get(subtopicId) || 'Easy';
        return fetchQuestionsForSubtopic(
          subtopicId,
          difficulty,
          answeredIds
        );
      });

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
      incrementQuestionsAnswered();

    } catch (error: any) {
      console.error("Error fetching next question:", error);
      toast({
        title: "Error fetching question",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [sessionId, session, subtopicIds, answeredIds, setCurrentQuestion, incrementQuestionsAnswered, toast]);

  useEffect(() => {
    if (session && !currentQuestion && subtopicIds.length > 0) {
      getNextQuestion();
    }
  }, [session, currentQuestion, subtopicIds, getNextQuestion]);

  return {
    currentQuestion,
    questionsAnswered,
    totalQuestions: session?.total_questions || 0,
    getNextQuestion,
    isComplete: session?.status === 'completed' || 
                (session?.total_questions && questionsAnswered >= session.total_questions),
    setQuestionsAnswered
  };
}
