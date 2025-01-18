import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useSessionManagement(initialModuleIndex = 0) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(initialModuleIndex);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: session, error: sessionError } = await supabase
        .from("test_sessions")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (sessionError) throw sessionError;
      setSessionId(session.id);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleModuleComplete = async () => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from("module_progress")
        .update({ completed_at: new Date().toISOString() })
        .eq("session_id", sessionId)
        .eq("module_id", currentModuleIndex.toString());

      if (error) throw error;

      if (currentModuleIndex === 0) {
        setCurrentModuleIndex(1);
      } else {
        const { error: sessionError } = await supabase
          .from("test_sessions")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", sessionId);

        if (sessionError) throw sessionError;
        navigate(`/gat/simulator/results/${sessionId}`);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error completing module",
        description: err.message
      });
    }
  };

  return {
    sessionId,
    currentModuleIndex,
    loading,
    error,
    initializeSession,
    handleModuleComplete,
    setCurrentModuleIndex
  };
}