import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAnswers } from "./useAnswers";
import { useQuestionFlags } from "./useQuestionFlags";
import { loadExistingAnswers } from "./utils/answerDbOperations";

export function useAnswerManagement(sessionId: string | null) {
  const { toast } = useToast();
  const [currentModuleProgressId, setCurrentModuleProgressId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const {
    answers,
    setAnswers,
    handleAnswer: handleAnswerUpdate,
    saveAllAnswers
  } = useAnswers(currentModuleProgressId);

  const {
    flagged,
    setFlagged,
    toggleFlag: toggleFlagState
  } = useQuestionFlags(currentModuleProgressId);

  // Load existing answers when session changes
  useEffect(() => {
    if (sessionId) {
      loadExistingAnswersData();
    }
  }, [sessionId]);

  // Auto-save answers every 30 seconds
  useEffect(() => {
    if (!sessionId || !currentModuleProgressId) return;

    const interval = setInterval(async () => {
      console.log("Auto-saving answers...");
      await saveAllAnswers(flagged);
    }, 30000);

    return () => clearInterval(interval);
  }, [sessionId, currentModuleProgressId, answers, flagged]);

  const loadExistingAnswersData = async () => {
    if (!sessionId) {
      console.log("No session ID provided");
      return;
    }

    try {
      setIsInitializing(true);
      console.log("Loading existing answers for session:", sessionId);
      
      const { answers: loadedAnswers, flagged: loadedFlags, moduleProgressId } = 
        await loadExistingAnswers(sessionId);
      
      setCurrentModuleProgressId(moduleProgressId);
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