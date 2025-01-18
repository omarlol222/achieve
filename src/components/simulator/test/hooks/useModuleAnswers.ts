import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useModuleAnswers = (moduleProgressId: string) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleAnswer = async (questionId: string, answer: number) => {
    try {
      const { error } = await supabase
        .from("module_answers")
        .insert({
          module_progress_id: moduleProgressId,
          question_id: questionId,
          selected_answer: answer,
          is_flagged: flagged[questionId] || false,
        });

      if (error) throw error;

      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));
    } catch (error: any) {
      console.error("Error saving answer:", error);
      toast({
        variant: "destructive",
        title: "Error saving answer",
        description: error.message,
      });
    }
  };

  const toggleFlag = (questionId: string) => {
    setFlagged(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  return {
    answers,
    flagged,
    handleAnswer,
    toggleFlag
  };
};