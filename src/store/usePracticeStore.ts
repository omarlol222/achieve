
import { create } from 'zustand';
import { PracticeQuestion } from '@/hooks/usePracticeQuestions';

interface PracticeState {
  currentQuestion: PracticeQuestion | null;
  questionsAnswered: number;
  selectedAnswer: number | null;
  streak: number;
  showFeedback: boolean;
  actions: {
    setCurrentQuestion: (question: PracticeQuestion | null) => void;
    setQuestionsAnswered: (count: number) => void;
    incrementQuestionsAnswered: () => void;
    setSelectedAnswer: (answer: number | null) => void;
    setStreak: (streak: number) => void;
    setShowFeedback: (show: boolean) => void;
    resetSession: () => void;
  };
}

export const usePracticeStore = create<PracticeState>((set) => ({
  currentQuestion: null,
  questionsAnswered: 0,
  selectedAnswer: null,
  streak: 0,
  showFeedback: false,
  actions: {
    setCurrentQuestion: (question) => set({ currentQuestion: question }),
    setQuestionsAnswered: (count) => set({ questionsAnswered: count }),
    incrementQuestionsAnswered: () => set((state) => ({ questionsAnswered: state.questionsAnswered + 1 })),
    setSelectedAnswer: (answer) => set({ selectedAnswer: answer }),
    setStreak: (streak) => set({ streak: streak }),
    setShowFeedback: (show) => set({ showFeedback: show }),
    resetSession: () => set({
      currentQuestion: null,
      questionsAnswered: 0,
      selectedAnswer: null,
      streak: 0,
      showFeedback: false
    })
  }
}));
