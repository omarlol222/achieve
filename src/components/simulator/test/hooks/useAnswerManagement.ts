import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAnswerManagement(moduleProgressId: string | null) {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  const loadExistingAnswers = async () => {
    if (!moduleProgressId) {
      console.log("No module progress ID provided");
      return;
    }

    try {
      console.log("Loading existing answers for module:", moduleProgressId);
      
      const { data: existingAnswers, error } = await supabase
        .from("module_answers")
        .select("question_id, selected_answer, is_flagged")
        .eq("module_progress_id", moduleProgressId);

      if (error) throw error;

      if (existingAnswers) {
        const answerMap: Record<string, number> = {};
        const flagMap: Record<string, boolean> = {};
        
        existingAnswers.forEach(answer => {
          if (answer.question_id) {
            answerMap[answer.question_id] = answer.selected_answer;
            flagMap[answer.question_id] = answer.is_flagged;
          }
        });
        
        console.log("Loaded answers:", answerMap);
        setAnswers(answerMap);
        setFlagged(flagMap);
      }
    } catch (err) {
      console.error("Error loading existing answers:", err);
    }
  };

  useEffect(() => {
    loadExistingAnswers();
  }, [moduleProgressId]);

  const handleAnswer = async (questionId: string, answer: number) => {
    if (!moduleProgressId) {
      console.error("No module progress ID available");
      return;
    }
    
    try {
      console.log("Saving answer:", { moduleProgressId, questionId, answer });
      
      // Update local state first
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));

      // Then persist to the database
      const { error } = await supabase
        .from("module_answers")
        .upsert({
          module_progress_id: moduleProgressId,
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
      
      console.log("Answer saved successfully");
    } catch (err: any) {
      console.error("Error saving answer:", err);
      toast({
        variant: "destructive",
        title: "Error saving answer",
        description: err.message
      });
    }
  };

  const toggleFlag = async (questionId: string) => {
    if (!moduleProgressId) return;
    
    const newFlaggedState = !flagged[questionId];
    
    try {
      setFlagged(prev => ({
        ...prev,
        [questionId]: newFlaggedState
      }));

      const { error } = await supabase
        .from("module_answers")
        .upsert({
          module_progress_id: moduleProgressId,
          question_id: questionId,
          selected_answer: answers[questionId],
          is_flagged: newFlaggedState
        });

      if (error) throw error;
    } catch (err: any) {
      // Revert flag state on error
      setFlagged(prev => ({
        ...prev,
        [questionId]: !newFlaggedState
      }));
      console.error("Error toggling flag:", err);
    }
  };

  return {
    answers,
    flagged,
    handleAnswer,
    toggleFlag
  };
}