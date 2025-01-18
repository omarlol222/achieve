import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAnswerManagement(sessionId: string | null) {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [currentModuleProgressId, setCurrentModuleProgressId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const loadExistingAnswers = async () => {
    if (!sessionId) {
      console.log("No session ID provided");
      return;
    }

    try {
      setIsInitializing(true);
      console.log("Loading existing answers for session:", sessionId);
      
      // First, get the current module progress ID
      const { data: moduleProgressData, error: moduleError } = await supabase
        .from("module_progress")
        .select("id")
        .eq("session_id", sessionId)
        .is("completed_at", null)
        .limit(1)
        .order('created_at', { ascending: false });

      if (moduleError) {
        console.error("Error loading module progress:", moduleError);
        toast({
          variant: "destructive",
          title: "Error loading module progress",
          description: moduleError.message
        });
        return;
      }

      if (!moduleProgressData || moduleProgressData.length === 0) {
        console.log("No active module progress found for session:", sessionId);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No active module progress found"
        });
        return;
      }

      const currentProgress = moduleProgressData[0];
      console.log("Found module progress:", currentProgress.id);
      setCurrentModuleProgressId(currentProgress.id);
      
      const { data: existingAnswers, error } = await supabase
        .from("module_answers")
        .select("question_id, selected_answer, is_flagged")
        .eq("module_progress_id", currentProgress.id);

      if (error) {
        console.error("Error loading answers:", error);
        toast({
          variant: "destructive",
          title: "Error loading answers",
          description: error.message
        });
        return;
      }

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
    } catch (err: any) {
      console.error("Error loading existing answers:", err);
      toast({
        variant: "destructive",
        title: "Error loading answers",
        description: "Please try refreshing the page"
      });
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadExistingAnswers();
    }
  }, [sessionId]);

  const handleAnswer = async (questionId: string, answer: number) => {
    if (!sessionId) {
      toast({
        variant: "destructive",
        title: "Error saving answer",
        description: "No active session found"
      });
      return;
    }

    if (!currentModuleProgressId) {
      // Try to reload module progress if it's not set
      await loadExistingAnswers();
      if (!currentModuleProgressId) {
        toast({
          variant: "destructive",
          title: "Error saving answer",
          description: "No active module progress found"
        });
        return;
      }
    }
    
    try {
      console.log("Saving answer:", { 
        moduleProgressId: currentModuleProgressId, 
        questionId, 
        answer 
      });
      
      // Update local state first for immediate feedback
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
        }, {
          onConflict: 'module_progress_id,question_id'
        });

      if (error) {
        console.error("Supabase error:", error);
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
    if (!sessionId || !currentModuleProgressId) {
      toast({
        variant: "destructive",
        title: "Error flagging question",
        description: "No active session found"
      });
      return;
    }
    
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
        }, {
          onConflict: 'module_progress_id,question_id'
        });

      if (error) throw error;
    } catch (err: any) {
      // Revert flag state on error
      setFlagged(prev => ({
        ...prev,
        [questionId]: !newFlaggedState
      }));
      console.error("Error toggling flag:", err);
      toast({
        variant: "destructive",
        title: "Error flagging question",
        description: err.message
      });
    }
  };

  return {
    answers,
    flagged,
    handleAnswer,
    toggleFlag,
    isInitializing
  };
}