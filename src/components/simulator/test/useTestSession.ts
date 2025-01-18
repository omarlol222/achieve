import { useEffect } from "react";
import { useSessionManagement } from "./hooks/useSessionManagement";
import { useQuestionManagement } from "./hooks/useQuestionManagement";
import { useAnswerManagement } from "./hooks/useAnswerManagement";

export function useTestSession(initialModuleIndex = 0) {
  const {
    sessionId,
    currentModuleIndex,
    loading,
    error,
    initializeSession,
    handleModuleComplete,
    setCurrentModuleIndex
  } = useSessionManagement(initialModuleIndex);

  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex
  } = useQuestionManagement(currentModuleIndex);

  const {
    answers,
    flagged,
    handleAnswer,
    toggleFlag
  } = useAnswerManagement(sessionId);

  useEffect(() => {
    initializeSession();
  }, []);

  const handleAnswerSelect = (answer: number) => {
    if (!questions[currentQuestionIndex]) return;
    handleAnswer(questions[currentQuestionIndex].id, answer);
  };

  return {
    sessionId,
    currentModuleIndex,
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    flagged,
    timeLeft: 3600, // TODO: Implement timer management in a separate hook
    loading,
    error,
    handleAnswer: handleAnswerSelect,
    handleModuleComplete,
    toggleFlag
  };
}