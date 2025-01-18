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
        setIsInitializing(true);
        console.log("Loading module data for index:", initialModuleIndex);
        
        // Get all modules with a row number based on order_index
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

        if (modulesError) {
          console.error("Error loading modules:", modulesError);
          setError("Failed to load module data");
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load module data"
          });
          return;
        }

        if (!modules || modules.length === 0) {
          console.error("No modules found");
          setError("No modules available");
          toast({
            variant: "destructive",
            title: "Error",
            description: "No modules available"
          });
          return;
        }

        // Sort modules by order_index and handle any gaps
        const sortedModules = modules.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        const module = sortedModules[initialModuleIndex];
        
        if (!module) {
          console.error("No module found at index:", initialModuleIndex);
          setError(`No module found at position ${initialModuleIndex + 1}`);
          toast({
            variant: "destructive",
            title: "Error",
            description: `No module found at position ${initialModuleIndex + 1}`
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