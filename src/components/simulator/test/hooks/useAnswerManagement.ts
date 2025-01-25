import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAnswerManagement(sessionId: string | null) {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [currentModuleProgressId, setCurrentModuleProgressId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load existing answers when session changes
  useEffect(() => {
    if (sessionId) {
      loadExistingAnswers();
    }
  }, [sessionId]);

  // Auto-save answers every 30 seconds
  useEffect(() => {
    if (!sessionId || !currentModuleProgressId) return;

    const interval = setInterval(async () => {
      console.log("Auto-saving answers...");
      await saveAllAnswers();
    }, 30000);

    return () => clearInterval(interval);
  }, [sessionId, currentModuleProgressId, answers]);

  const loadExistingAnswers = async () => {
    if (!sessionId) {
      console.log("No session ID provided");
      return;
    }

    try {
      setIsInitializing(true);
      console.log("Loading existing answers for session:", sessionId);
      
      // Get current module progress using maybeSingle
      const { data: moduleProgressData, error: moduleError } = await supabase
        .from("module_progress")
        .select("id")
        .eq("session_id", sessionId)
        .is("completed_at", null)
        .maybeSingle();

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

  const saveAllAnswers = async () => {
    if (!currentModuleProgressId) return;

    const promises = Object.entries(answers).map(([questionId, answer]) => 
      saveAnswer(questionId, answer)
    );

    try {
      await Promise.all(promises);
      console.log("All answers saved successfully");
    } catch (err) {
      console.error("Error saving answers:", err);
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
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));

      await saveAnswer(questionId, answer);
      
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

  const saveAnswer = async (questionId: string, answer: number) => {
    if (!currentModuleProgressId) return;

    const { data: questionData } = await supabase
      .from("questions")
      .select("correct_answer")
      .eq("id", questionId)
      .maybeSingle();

    const isCorrect = questionData?.correct_answer === answer;

    const { data: existingAnswer } = await supabase
      .from("module_answers")
      .select("id")
      .eq("module_progress_id", currentModuleProgressId)
      .eq("question_id", questionId)
      .maybeSingle();

    if (existingAnswer) {
      await supabase
        .from("module_answers")
        .update({
          selected_answer: answer,
          is_correct: isCorrect,
          is_flagged: flagged[questionId] || false
        })
        .eq("id", existingAnswer.id);
    } else {
      await supabase
        .from("module_answers")
        .insert({
          module_progress_id: currentModuleProgressId,
          question_id: questionId,
          selected_answer: answer,
          is_correct: isCorrect,
          is_flagged: flagged[questionId] || false
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

      const { data: existingAnswer } = await supabase
        .from("module_answers")
        .select("id")
        .eq("module_progress_id", currentModuleProgressId)
        .eq("question_id", questionId)
        .maybeSingle();

      if (existingAnswer) {
        await supabase
          .from("module_answers")
          .update({ is_flagged: newFlaggedState })
          .eq("id", existingAnswer.id);
      } else {
        await supabase
          .from("module_answers")
          .insert({
            module_progress_id: currentModuleProgressId,
            question_id: questionId,
            is_flagged: newFlaggedState
          });
      }
    } catch (err: any) {
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
    isInitializing,
    saveAllAnswers
  };
}