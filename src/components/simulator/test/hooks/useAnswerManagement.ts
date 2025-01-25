import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAnswers } from "./useAnswers";
import { useQuestionFlags } from "./useQuestionFlags";
import { loadExistingAnswers } from "./utils/answerDbOperations";

export function useAnswerManagement(sessionId: string | null, moduleProgressId: string | null) {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(true);

  const {
    answers,
    setAnswers,
    handleAnswer: handleAnswerUpdate,
    saveAllAnswers
  } = useAnswers(moduleProgressId);

  const {
    flagged,
    setFlagged,
    toggleFlag: toggleFlagState
  } = useQuestionFlags(moduleProgressId);

  // Load existing answers when session changes
  useEffect(() => {
    if (sessionId && moduleProgressId) {
      loadExistingAnswersData();
    }
  }, [sessionId, moduleProgressId]);

  // Auto-save answers every 30 seconds
  useEffect(() => {
    if (!sessionId || !moduleProgressId) return;

    const interval = setInterval(async () => {
      console.log("Auto-saving answers...");
      await saveAllAnswers(flagged);
    }, 30000);

    return () => clearInterval(interval);
  }, [sessionId, moduleProgressId, answers, flagged]);

  const loadExistingAnswersData = async () => {
    if (!sessionId || !moduleProgressId) {
      console.log("No session ID or module progress ID provided");
      return;
    }

    try {
      setIsInitializing(true);
      console.log("Loading existing answers for session:", sessionId);
      
      const { answers: loadedAnswers, flagged: loadedFlags } = 
        await loadExistingAnswers(sessionId);
      
      setAnswers(loadedAnswers);
      setFlagged(loadedFlags);
    } catch (err: any) {
      console.error("Error loading existing answers:", err);
      toast({
        variant: "destructive",
        title: "Error loading answers",
        description: "Please try refreshing the page"
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAnswer = async (questionId: string, answer: number) => {
    if (!moduleProgressId) {
      console.error("No active module progress found");
      toast({
        variant: "destructive",
        title: "Error saving answer",
        description: "No active session found"
      });
      return;
    }
    await handleAnswerUpdate(questionId, answer, flagged[questionId] || false);
  };

  const toggleFlag = async (questionId: string) => {
    await toggleFlagState(questionId, answers[questionId]);
  };

  return {
    answers,
    flagged,
    handleAnswer,
    toggleFlag,
    isInitializing,
    saveAllAnswers
  };
}