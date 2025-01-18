import { useState, useEffect, useCallback } from "react";

export const useQuestionNavigation = (totalQuestions: number, timeLimit: number = 30) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // Convert minutes to seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  return {
    currentIndex,
    setCurrentIndex,
    goToNext,
    goToPrevious,
    isFirstQuestion: currentIndex === 0,
    isLastQuestion: currentIndex === totalQuestions - 1,
    timeLeft,
  };
};