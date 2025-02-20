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
  category?: 'analogy' | 'vocabulary' | 'grammar' | 'reading' | 'writing';
};

type SubtopicAttempts = {
  subtopics: string[];
};

function validateQuestionType(type: string): 'normal' | 'passage' | 'analogy' | 'comparison' {
  if (type === 'normal' || type === 'passage' || type === 'analogy' || type === 'comparison') {
    return type;
  }
  return 'normal'; // Default fallback
}

function transformToPracticeQuestion(dbQuestion: any): PracticeQuestion {
  return {
    ...dbQuestion,
    question_type: validateQuestionType(dbQuestion.question_type)
  };
}

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
      setShowFeedback,
      resetSession
    }
  } = usePracticeStore();

  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["practice-session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      
      const { error: resetError } = await supabase
        .from("practice_sessions")
        .update({ questions_answered: 0 })
        .eq("id", sessionId);
        
      if (resetError) {
        console.error("Error resetting session:", resetError);
      }
      
      const { data, error } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) {
        console.error("Error fetching session:", error);
        throw error;
      }

      return data;
    },
    enabled: !!sessionId
  });

  useEffect(() => {
    if (sessionId) {
      console.log("Resetting session state");
      resetSession();
    }
  }, [sessionId, resetSession]);

  const subtopicIds = (session?.subtopic_attempts as SubtopicAttempts)?.subtopics || [];
  const { data: answeredIds = [] } = useAnsweredQuestions(sessionId);

  useEffect(() => {
    if (session?.user_id) {
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
    }
  }, [session?.user_id, showAchievementNotification]);

  const getNextQuestion = useCallback(async () => {
    if (!sessionId || !session?.subject || subtopicIds.length === 0) {
      console.log("Early return conditions:", {
        sessionId,
        subject: session?.subject,
        subtopicIdsLength: subtopicIds.length,
        questionsAnswered
      });
      return;
    }

    try {
      const { data: statisticsData } = await supabase
        .from('user_subtopic_statistics')
        .select('subtopic_id, accuracy, difficulty_level')
        .in('subtopic_id', subtopicIds)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      const subtopicDifficulties = new Map(
        statisticsData?.map(stat => [
          stat.subtopic_id,
          stat.difficulty_level || (
            stat.accuracy && stat.accuracy >= 0.8 ? 'Hard' :
            stat.accuracy && stat.accuracy >= 0.6 ? 'Moderate' : 'Easy'
          )
        ]) || []
      );

      const lastAnswer = answeredIds.length > 0 ? await supabase
        .from('practice_answers')
        .select('is_correct, question_id')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single() : null;

      if (lastAnswer?.data && !lastAnswer.data.is_correct) {
        const { data: lastQuestion } = await supabase
          .from('questions')
          .select('question_type, category, subtopic_id')
          .eq('id', lastAnswer.data.question_id)
          .single();

        if (lastQuestion) {
          const { question_type, category, subtopic_id } = lastQuestion;
          console.log("Last question was wrong, fetching similar type:", { question_type, category });

          const currentDifficulty = subtopicDifficulties.get(subtopic_id) || 'Easy';
          const easierDifficulty = currentDifficulty === 'Hard' ? 'Moderate' : 'Easy';

          const { data: similarQuestions } = await supabase
            .from('questions')
            .select('*')
            .eq('question_type', question_type)
            .eq('category', category)
            .eq('difficulty', easierDifficulty)
            .in('subtopic_id', subtopicIds)
            .not('id', 'in', answeredIds);

          if (similarQuestions && similarQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * similarQuestions.length);
            const nextQuestion = transformToPracticeQuestion(similarQuestions[randomIndex]);
            setCurrentQuestion(nextQuestion);
            incrementQuestionsAnswered();
            return;
          }
        }
      }

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
      const nextQuestion = transformToPracticeQuestion(availableQuestions[randomIndex]);
      
      if (nextQuestion) {
        console.log("Setting next question, current questions answered:", questionsAnswered);
        setCurrentQuestion(nextQuestion);
        incrementQuestionsAnswered();
      }

    } catch (error: any) {
      console.error("Error fetching next question:", error);
      toast({
        title: "Error fetching question",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [sessionId, session, subtopicIds, answeredIds, setCurrentQuestion, incrementQuestionsAnswered, toast, questionsAnswered]);

  useEffect(() => {
    if (session && !currentQuestion && subtopicIds.length > 0) {
      console.log("Initial question fetch, current questions answered:", questionsAnswered);
      getNextQuestion();
    }
  }, [session, currentQuestion, subtopicIds, getNextQuestion, questionsAnswered]);

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
