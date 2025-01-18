import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAnswerManagement(sessionId: string | null) {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  const loadExistingAnswers = async () => {
    if (!sessionId) return;

    try {
      const { data: existingAnswers } = await supabase
        .from("module_answers")
        .select("question_id, selected_answer, is_flagged")
        .eq("module_progress_id", sessionId);

      if (existingAnswers) {
        const answerMap: Record<string, number> = {};
        const flagMap: Record<string, boolean> = {};
        
        existingAnswers.forEach(answer => {
          if (answer.question_id) {
            answerMap[answer.question_id] = answer.selected_answer;
            flagMap[answer.question_id] = answer.is_flagged;
          }
        });
        
        setAnswers(answerMap);
        setFlagged(flagMap);
      }
    } catch (err) {
      console.error("Error loading existing answers:", err);
    }
  };

  useEffect(() => {
    loadExistingAnswers();
  }, [sessionId]);

  const handleAnswer = async (questionId: string, answer: number) => {
    if (!sessionId) return;
    
    try {
      // First update the local state
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));

      // Then persist to the database
      const { error } = await supabase
        .from("module_answers")
        .upsert({
          module_progress_id: sessionId,
          question_id: questionId,
          selected_answer: answer,
          is_flagged: flagged[questionId] || false
        });

      if (error) {
        // If there's an error, revert the local state
        setAnswers(prev => {
          const newState = { ...prev };
          delete newState[questionId];
          return newState;
        });
        throw error;
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error saving answer",
        description: err.message
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
}