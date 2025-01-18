import { useState, useEffect } from "react";
import { useSessionManagement } from "./hooks/useSessionManagement";
import { useQuestionManagement } from "./hooks/useQuestionManagement";
import { useAnswerManagement } from "./hooks/useAnswerManagement";
import { supabase } from "@/integrations/supabase/client";

export function useTestSession(initialModuleIndex = 0) {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentModule, setCurrentModule] = useState<any>(null);
  
  const {
    sessionId,
    loading,
    initializeSession,
    completeModule
  } = useSessionManagement(initialModuleIndex);

  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex
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
        const { data: module, error } = await supabase
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
          .single();

        if (error) {
          console.error("Error loading module:", error);
          return;
        }

        console.log("Loaded module:", module);
        setCurrentModule(module);
      } catch (err) {
        console.error("Error in loadModuleData:", err);
      }
    };

    loadModuleData();
  }, [initialModuleIndex]);

  useEffect(() => {
    initializeSession();
  }, []);

  const handleAnswerSelect = async (answer: number) => {
    if (!questions[currentQuestionIndex]) return;
    const questionId = questions[currentQuestionIndex].id;
    await handleAnswer(questionId, answer);
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
    loading,
    error: null,
    handleAnswer: handleAnswerSelect,
    handleModuleComplete: completeModule,
    toggleFlag,
    hasStarted,
    setHasStarted,
    currentModule
  };
}