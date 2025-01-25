import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { saveAnswer } from "./utils/answerDbOperations";

export function useQuestionFlags(moduleProgressId: string | null) {
  const { toast } = useToast();
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  const toggleFlag = async (questionId: string, currentAnswer?: number) => {
    if (!moduleProgressId) {
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

      await saveAnswer(
        moduleProgressId,
        questionId,
        currentAnswer || 0,
        newFlaggedState
      );
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
    flagged,
    setFlagged,
    toggleFlag
  };
}