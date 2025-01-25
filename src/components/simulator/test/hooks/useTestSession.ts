import { useState, useEffect } from "react";
import { useSessionManagement } from "./useSessionManagement";
import { useQuestionManagement } from "./useQuestionManagement";
import { useAnswerManagement } from "./useAnswerManagement";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useTestSession(initialModuleIndex = 0) {
  const { toast } = useToast();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentModule, setCurrentModule] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    sessionId,
    loading: sessionLoading,
    initializeSession,
    completeModule
  } = useSessionManagement(initialModuleIndex);

  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    loading: questionsLoading
  } = useQuestionManagement(initialModuleIndex);

  const {
    answers,
    flagged,
    handleAnswer,
    toggleFlag,
    saveAllAnswers
  } = useAnswerManagement(sessionId);

  // Load module data
  useEffect(() => {
    const loadModuleData = async () => {
      try {
        setIsInitializing(true);
        
        const { data: modules, error: modulesError } = await supabase
          .from("test_modules")
          .select(`
            id,
            name,
            description,
            time_limit,
            order_index,
            subject:subjects (
              id,
              name
            )
          `)
          .order('order_index', { ascending: true });

        if (modulesError) throw modulesError;
        if (!modules?.length) throw new Error("No modules available");

        const sortedModules = modules.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        const module = sortedModules[initialModuleIndex];
        
        if (!module) {
          throw new Error(`No module found at position ${initialModuleIndex + 1}`);
        }

        setCurrentModule(module);
        setError(null);
      } catch (err: any) {
        console.error("Error in loadModuleData:", err);
        setError(err.message || "An unexpected error occurred");
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Failed to load module"
        });
      } finally {
        setIsInitializing(false);
      }
    };

    loadModuleData();
  }, [initialModuleIndex, toast]);

  // Initialize session when component mounts
  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      await initializeSession();
      setIsInitializing(false);
    };

    if (hasStarted && !sessionId) {
      init();
    }
  }, [hasStarted, sessionId, initializeSession]);

  const handleAnswerSelect = async (questionId: string, answer: number) => {
    if (!sessionId) {
      console.error("No active session");
      return;
    }
    await handleAnswer(questionId, answer);
  };

  const handleModuleComplete = async () => {
    if (!sessionId) {
      console.error("No active session");
      return;
    }

    // Save all answers before completing the module
    await saveAllAnswers();
    await completeModule();
  };

  return {
    sessionId,
    currentModuleIndex: initialModuleIndex,
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    flagged,
    timeLeft: currentModule?.time_limit ? currentModule.time_limit * 60 : 3600,
    loading: sessionLoading || questionsLoading || isInitializing,
    error,
    handleAnswer: handleAnswerSelect,
    handleModuleComplete,
    toggleFlag,
    hasStarted,
    setHasStarted,
    currentModule,
    saveProgress: saveAllAnswers
  };
}