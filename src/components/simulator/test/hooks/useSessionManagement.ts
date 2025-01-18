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

      console.log("Creating new test session for user:", user.id);
      
      const { data: session, error: sessionError } = await supabase
        .from("test_sessions")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (sessionError) throw sessionError;
      
      console.log("Created test session:", session.id);
      setSessionId(session.id);
      
      // Initialize first module progress
      const { error: moduleError } = await supabase
        .from("module_progress")
        .insert({
          session_id: session.id,
          module_id: currentModuleIndex.toString(),
          started_at: new Date().toISOString()
        });

      if (moduleError) throw moduleError;
      
      console.log("Initialized first module progress");
      setLoading(false);
    } catch (err: any) {
      console.error("Error initializing session:", err);
      setError(err.message);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error starting test",
        description: err.message
      });
    }
  };

  const handleModuleComplete = async () => {
    if (!sessionId) {
      console.error("No session ID found");
      return;
    }

    try {
      console.log("Completing module:", currentModuleIndex);
      
      // Update current module progress
      const { error: progressError } = await supabase
        .from("module_progress")
        .update({ 
          completed_at: new Date().toISOString() 
        })
        .eq("session_id", sessionId)
        .eq("module_id", currentModuleIndex.toString());

      if (progressError) throw progressError;
      
      console.log("Updated module progress completion");

      if (currentModuleIndex === 0) {
        // Start next module
        const { error: nextModuleError } = await supabase
          .from("module_progress")
          .insert({
            session_id: sessionId,
            module_id: "1",
            started_at: new Date().toISOString()
          });

        if (nextModuleError) throw nextModuleError;
        
        console.log("Created next module progress");
        setCurrentModuleIndex(1);
      } else {
        // Complete session
        const { error: sessionError } = await supabase
          .from("test_sessions")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", sessionId);

        if (sessionError) throw sessionError;
        
        console.log("Completed test session");
        navigate(`/gat/simulator/results/${sessionId}`);
      }
    } catch (err: any) {
      console.error("Error completing module:", err);
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