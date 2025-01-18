import { useState, useEffect } from "react";
import { useSessionManagement } from "./hooks/useSessionManagement";
import { useQuestionManagement } from "./hooks/useQuestionManagement";
import { useAnswerManagement } from "./hooks/useAnswerManagement";
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
    toggleFlag
  } = useAnswerManagement(sessionId);

  // Load module data
  useEffect(() => {
    const loadModuleData = async () => {
      try {
        console.log("Loading module data for index:", initialModuleIndex);
        const { data: module, error: moduleError } = await supabase
          .from("test_modules")
          .select(`
            id,
            name,
            description,
            time_limit,
            subject:subjects (
              id,
              name
            )
          `)
          .eq("order_index", initialModuleIndex)
          .maybeSingle();

        if (moduleError) {
          console.error("Error loading module:", moduleError);
          setError("Failed to load module data");
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load module data"
          });
          return;
        }

        if (!module) {
          console.error("No module found for index:", initialModuleIndex);
          setError(`No module found with order index ${initialModuleIndex}`);
          toast({
            variant: "destructive",
            title: "Error",
            description: `No module found with order index ${initialModuleIndex}`
          });
          return;
        }

        console.log("Loaded module:", module);
        setCurrentModule(module);
        setError(null);
      } catch (err) {
        console.error("Error in loadModuleData:", err);
        setError("An unexpected error occurred");
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred while loading the module"
        });
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
    currentModule
  };
}