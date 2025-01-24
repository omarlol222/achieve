import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAnswerManagement(sessionId: string | null) {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [currentModuleProgressId, setCurrentModuleProgressId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadExistingAnswers();
    }
  }, [sessionId]);

  const loadExistingAnswers = async () => {
    if (!sessionId) {
      console.log("No session ID provided");
      return;
    }

    try {
      setIsInitializing(true);
      console.log("Loading existing answers for session:", sessionId);
      
      // Get current module progress
      const { data: moduleProgressData, error: moduleError } = await supabase
        .from("module_progress")
        .select("id")
        .eq("session_id", sessionId)
        .is("completed_at", null)
        .single();

      if (moduleError) {
        console.error("Error loading module progress:", moduleError);
        toast({
          variant: "destructive",
          title: "Error loading module progress",
          description: moduleError.message
        });
        return;
      }

      if (!moduleProgressData) {
        console.log("No active module progress found for session:", sessionId);
        return;
      }

      console.log("Found module progress:", moduleProgressData.id);
      setCurrentModuleProgressId(moduleProgressData.id);
      
      // Load existing answers
      const { data: existingAnswers, error: answersError } = await supabase
        .from("module_answers")
        .select("question_id, selected_answer, is_flagged")
        .eq("module_progress_id", moduleProgressData.id);

      if (answersError) {
        console.error("Error loading answers:", answersError);
        toast({
          variant: "destructive",
          title: "Error loading answers",
          description: answersError.message
        });
        return;
      }

      if (existingAnswers) {
        const answerMap: Record<string, number> = {};
        const flagMap: Record<string, boolean> = {};
        
        existingAnswers.forEach(answer => {
          if (answer.question_id) {
            answerMap[answer.question_id] = answer.selected_answer;
            flagMap[answer.question_id] = answer.is_flagged || false;
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

  const handleAnswer = async (questionId: string, answer: number) => {
    if (!sessionId || !currentModuleProgressId) {
      console.error("No active session or module progress found");
      toast({
        variant: "destructive",
        title: "Error saving answer",
        description: "No active session found"
      });
      return;
    }

    try {
      // Update local state immediately for UI responsiveness
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));

      // Get the correct answer to determine if the selected answer is correct
      const { data: questionData } = await supabase
        .from("questions")
        .select("correct_answer")
        .eq("id", questionId)
        .single();

      const isCorrect = questionData?.correct_answer === answer;

      // Check if answer already exists
      const { data: existingAnswer } = await supabase
        .from("module_answers")
        .select("id")
        .eq("module_progress_id", currentModuleProgressId)
        .eq("question_id", questionId)
        .single();

      if (existingAnswer) {
        // Update existing answer
        const { error: updateError } = await supabase
          .from("module_answers")
          .update({
            selected_answer: answer,
            is_correct: isCorrect,
            is_flagged: flagged[questionId] || false
          })
          .eq("id", existingAnswer.id);

        if (updateError) throw updateError;
      } else {
        // Insert new answer
        const { error: insertError } = await supabase
          .from("module_answers")
          .insert({
            module_progress_id: currentModuleProgressId,
            question_id: questionId,
            selected_answer: answer,
            is_correct: isCorrect,
            is_flagged: flagged[questionId] || false
          });

        if (insertError) throw insertError;
      }

      console.log("Answer saved successfully");
      
    } catch (err: any) {
      console.error("Error saving answer:", err);
      // Revert local state on error
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
      // Update local state immediately
      setFlagged(prev => ({
        ...prev,
        [questionId]: newFlaggedState
      }));

      // Check if answer exists
      const { data: existingAnswer } = await supabase
        .from("module_answers")
        .select("id")
        .eq("module_progress_id", currentModuleProgressId)
        .eq("question_id", questionId)
        .single();

      if (existingAnswer) {
        // Update existing answer
        const { error } = await supabase
          .from("module_answers")
          .update({ is_flagged: newFlaggedState })
          .eq("id", existingAnswer.id);

        if (error) throw error;
      } else {
        // Insert new answer with flag
        const { error } = await supabase
          .from("module_answers")
          .insert({
            module_progress_id: currentModuleProgressId,
            question_id: questionId,
            is_flagged: newFlaggedState
          });

        if (error) throw error;
      }
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