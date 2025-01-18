import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAnswerManagement(sessionId: string | null) {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [currentModuleProgressId, setCurrentModuleProgressId] = useState<string | null>(null);

  const loadExistingAnswers = async () => {
    if (!sessionId) {
      console.log("No session ID provided");
      return;
    }

    try {
      console.log("Loading existing answers for session:", sessionId);
      
      // First, get the current module progress ID
      const { data: moduleProgress, error: moduleError } = await supabase
        .from("module_progress")
        .select("id")
        .eq("session_id", sessionId)
        .is("completed_at", null)
        .single();

      if (moduleError) {
        console.error("Error loading module progress:", moduleError);
        return;
      }

      setCurrentModuleProgressId(moduleProgress.id);
      
      const { data: existingAnswers, error } = await supabase
        .from("module_answers")
        .select("question_id, selected_answer, is_flagged")
        .eq("module_progress_id", moduleProgress.id);

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
  }, [sessionId]);

  const handleAnswer = async (questionId: string, answer: number) => {
    if (!sessionId || !currentModuleProgressId) {
      console.error("No session ID or module progress ID available");
      return;
    }
    
    try {
      console.log("Saving answer:", { moduleProgressId: currentModuleProgressId, questionId, answer });
      
      // Update local state first
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));

      // Then persist to the database
      const { error } = await supabase
        .from("module_answers")
        .upsert({
          module_progress_id: currentModuleProgressId,
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
    if (!sessionId || !currentModuleProgressId) return;
    
    const newFlaggedState = !flagged[questionId];
    
    try {
      setFlagged(prev => ({
        ...prev,
        [questionId]: newFlaggedState
      }));

      const { error } = await supabase
        .from("module_answers")
        .upsert({
          module_progress_id: currentModuleProgressId,
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