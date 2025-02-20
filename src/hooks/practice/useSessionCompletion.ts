
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSessionCompletion(
  sessionId: string | undefined,
  setCurrentQuestion: (question: any) => void
) {
  return useCallback(async (currentAnsweredCount: number) => {
    if (!sessionId) return;
    
    await supabase
      .from("practice_sessions")
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        questions_answered: currentAnsweredCount
      })
      .eq("id", sessionId);
    
    setCurrentQuestion(null);
  }, [sessionId, setCurrentQuestion]);
}
