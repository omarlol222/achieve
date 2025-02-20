
import { useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePracticeStore } from "@/store/usePracticeStore";
import { useSession } from "./practice/useSession";
import { useSubtopics } from "./practice/useSubtopics";
import { useAnsweredQuestions } from "./practice/useAnsweredQuestions";
import { fetchQuestionsForSubtopic, fetchFallbackQuestions } from "./practice/useQuestionFetcher";
import { useAchievementHandler } from "./practice/useAchievementHandler";
import { useSessionCompletion } from "./practice/useSessionCompletion";
import { useAnswerSubmission } from "./practice/useAnswerSubmission";
import { supabase } from "@/integrations/supabase/client";
import { PracticeQuestion } from "./practice/types";

export type { PracticeQuestion };

export function usePracticeQuestions(sessionId: string | undefined) {
  const { toast } = useToast();
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

  const { data: session } = useSession(sessionId);
  const { data: subtopicIds = [] } = useSubtopics(session?.subject);
  const { data: answeredIds = [] } = useAnsweredQuestions(sessionId);
  const userId = session?.user_id;

  useAchievementHandler(userId);
  const completeSession = useSessionCompletion(sessionId, setCurrentQuestion);

  const getNextQuestion = useCallback(async () => {
    if (!sessionId || !session?.subject || subtopicIds.length === 0) {
      return;
    }

    try {
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
        progressData?.map(p => [p.subtopic_id, p.difficulty_level || 'Easy']) || []
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

  const handleAnswerSubmit = useAnswerSubmission(
    sessionId,
    userId,
    setStreak,
    incrementQuestionsAnswered,
    setShowFeedback,
    setSelectedAnswer,
    getNextQuestion,
    questionsAnswered,
    session?.total_questions || 0
  );

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
    handleAnswerSubmit: () => handleAnswerSubmit(selectedAnswer, currentQuestion),
    isComplete: session?.status === 'completed' || 
                (session?.total_questions && questionsAnswered >= session.total_questions)
  };
}
