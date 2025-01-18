import { useEffect } from "react";
import { useSessionManagement } from "./hooks/useSessionManagement";
import { useQuestionManagement } from "./hooks/useQuestionManagement";
import { useAnswerManagement } from "./hooks/useAnswerManagement";

export function useTestSession(initialModuleIndex = 0) {
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
    timeLeft: 3600, // TODO: Implement timer management in a separate hook
    loading,
    error: null,
    handleAnswer: handleAnswerSelect,
    handleModuleComplete: completeModule,
    toggleFlag
  };
}