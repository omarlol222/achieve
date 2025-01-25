import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { saveAnswer } from "./utils/answerDbOperations";

export function useAnswers(moduleProgressId: string | null) {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const handleAnswer = async (
    questionId: string,
    answer: number,
    isFlagged: boolean
  ) => {
    if (!moduleProgressId) {
      console.error("No active session or module progress found");
      toast({
        variant: "destructive",
        title: "Error saving answer",
        description: "No active session found"
      });
      return;
    }

    try {
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));

      await saveAnswer(moduleProgressId, questionId, answer, isFlagged);
    } catch (err: any) {
      console.error("Error saving answer:", err);
      setAnswers(prev => {
        const newState = { ...prev };
        delete newState[questionId];
        return newState;
      });
      toast({
        variant: "destructive",
        title: "Error saving answer",
        description: err.message
      });
    }
  };

  const saveAllAnswers = async (flagged: Record<string, boolean>) => {
    if (!moduleProgressId) return;

    const promises = Object.entries(answers).map(([questionId, answer]) => 
      saveAnswer(moduleProgressId, questionId, answer, flagged[questionId] || false)
    );

    try {
      await Promise.all(promises);
      console.log("All answers saved successfully");
    } catch (err) {
      console.error("Error saving answers:", err);
    }
  };

  return {
    answers,
    setAnswers,
    handleAnswer,
    saveAllAnswers
  };
}