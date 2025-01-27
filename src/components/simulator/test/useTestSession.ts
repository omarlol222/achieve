import { useState, useEffect } from "react";
import { useSessionManagement } from "./hooks/useSessionManagement";
import { useQuestionManagement } from "./hooks/useQuestionManagement";
import { useAnswerManagement } from "./hooks/useAnswerManagement";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useTestSession() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentModule, setCurrentModule] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allModules, setAllModules] = useState<any[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  
  const {
    sessionId,
    moduleProgressId,
    loading: sessionLoading,
    initializeSession,
    completeModule
  } = useSessionManagement(currentModuleIndex);

  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    loading: questionsLoading
  } = useQuestionManagement(currentModuleIndex);

  const {
    answers,
    flagged,
    handleAnswer,
    toggleFlag
  } = useAnswerManagement(sessionId, moduleProgressId);

  // Load ordered modules data
  useEffect(() => {
    const loadModuleData = async () => {
      try {
        setIsInitializing(true);
        console.log("Loading ordered modules...");
        
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

        setAllModules(modules);
        const currentModule = modules[currentModuleIndex];
        
        if (!currentModule) {
          console.error("No module found at index:", currentModuleIndex);
          setError(`No module found at position ${currentModuleIndex + 1}`);
          toast({
            variant: "destructive",
            title: "Error",
            description: `No module found at position ${currentModuleIndex + 1}`
          });
          return;
        }

        console.log("Loaded current module:", currentModule);
        setCurrentModule(currentModule);
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
  }, [currentModuleIndex, toast]);

  // Initialize session when component mounts
  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      await initializeSession();
      setIsInitializing(false);
    };

    if (hasStarted && !sessionId && currentModule?.id) {
      init();
    }
  }, [hasStarted, sessionId, initializeSession, currentModule]);

  const handleAnswerSelect = async (questionId: string, answer: number) => {
    if (!sessionId || !moduleProgressId) {
      console.error("No active session or module progress");
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

    // Check if there are more modules
    if (currentModuleIndex < allModules.length - 1) {
      // Move to next module
      setCurrentQuestionIndex(0); // Reset question index for new module
      setCurrentModuleIndex(prev => prev + 1);
      
      // Show transition message
      toast({
        title: "Module Complete",
        description: "Moving to next module...",
      });
    } else {
      // All modules completed, navigate to results
      navigate(`/gat/simulator/results/${sessionId}`);
    }
  };

  return {
    sessionId,
    currentModuleIndex,
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
    isLastModule: currentModuleIndex === allModules.length - 1,
    totalModules: allModules.length
  };
}