import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

  const { data: session } = useSession(sessionId);
  const { data: subtopicIds = [] } = useSubtopics(session?.subject);
  const { data: answeredIds = [] } = useAnsweredQuestions(sessionId);
  const userId = session?.user_id;

  const calculatePoints = (isCorrect: boolean, difficulty: string, currentStreak: number) => {
    if (!isCorrect) return 0;
    
    let basePoints = 0;
    switch (difficulty) {
      case 'Easy':
        basePoints = 5;
        break;
      case 'Moderate':
        basePoints = 10;
        break;
      case 'Hard':
        basePoints = 15;
        break;
      default:
        basePoints = 5;
    }

    const streakBonus = currentStreak >= 3 ? Math.min(currentStreak - 2, 3) : 0;
    return basePoints + streakBonus;
  };

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
    
    const { data: answers } = await supabase
      .from("practice_answers")
      .select('points_earned')
      .eq('session_id', sessionId);
    
    const totalPoints = (answers || []).reduce(
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
  }, [sessionId, setCurrentQuestion]);

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

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentQuestion || !sessionId || !userId) {
      toast({
        title: "Error",
        description: "Please select an answer and ensure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    try {
      const isCorrect = selectedAnswer === currentQuestion.correct_answer;
      const pointsEarned = calculatePoints(isCorrect, currentQuestion.difficulty, streak);

      console.log(`Processing answer for question ${currentQuestion.id}:`, {
        isCorrect,
        difficulty: currentQuestion.difficulty,
        streak,
        pointsEarned
      });

      // First save the answer and points in practice_answers
      const { error: answerError } = await supabase
        .from("practice_answers")
        .insert({
          session_id: sessionId,
          question_id: currentQuestion.id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          streak_at_answer: streak,
          user_id: userId,
          points_earned: pointsEarned,
          subtopic_id: currentQuestion.subtopic_id
        });

      if (answerError) throw answerError;

      // Then update user progress
      if (currentQuestion.subtopic_id) {
        // Get current progress including all needed fields
        const { data: existingProgress } = await supabase
          .from("user_subtopic_progress")
          .select('current_score, questions_answered, correct_answers')
          .eq("user_id", userId)
          .eq("subtopic_id", currentQuestion.subtopic_id)
          .maybeSingle();

        const currentScore = existingProgress?.current_score || 0;
        const questionsAnswered = existingProgress?.questions_answered || 0;
        const correctAnswers = existingProgress?.correct_answers || 0;

        // Calculate new score ensuring it doesn't exceed 500
        const newScore = Math.max(0, Math.min(500, currentScore + pointsEarned));

        console.log("Updating user progress:", {
          subtopicId: currentQuestion.subtopic_id,
          currentScore,
          pointsEarned,
          newScore,
          questionsAnswered,
          correctAnswers
        });

        // Update progress with accurate counting
        const { error: progressError } = await supabase
          .from("user_subtopic_progress")
          .upsert({
            user_id: userId,
            subtopic_id: currentQuestion.subtopic_id,
            current_score: newScore,
            last_practiced: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            questions_answered: questionsAnswered + 1,
            correct_answers: correctAnswers + (isCorrect ? 1 : 0),
            accuracy: ((correctAnswers + (isCorrect ? 1 : 0)) / (questionsAnswered + 1))
          }, {
            onConflict: 'user_id,subtopic_id'
          });

        if (progressError) {
          console.error("Error updating progress:", progressError);
          throw progressError;
        }

        // First get current session points
        const { data: currentSession } = await supabase
          .from("practice_sessions")
          .select('total_points')
          .eq('id', sessionId)
          .single();

        const currentTotalPoints = currentSession?.total_points || 0;
        
        // Update session total points
        const { error: sessionError } = await supabase
          .from("practice_sessions")
          .update({ 
            total_points: currentTotalPoints + pointsEarned,
            updated_at: new Date().toISOString()
          })
          .eq("id", sessionId);

        if (sessionError) {
          console.error("Error updating session points:", sessionError);
          throw sessionError;
        }
      }

      // Update local state after confirming all database updates
      const newStreak = isCorrect ? streak + 1 : 0;
      setStreak(newStreak);
      incrementQuestionsAnswered();
      setShowFeedback(true);

      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        
        if (questionsAnswered >= session?.total_questions) {
          navigate(`/gat/practice/results/${sessionId}`);
        } else {
          getNextQuestion();
        }
      }, 2000);

    } catch (error: any) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error submitting answer",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
    handleAnswerSubmit,
    isComplete
  };
}
