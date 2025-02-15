
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useSessionManagement(currentModuleIndex: number) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [moduleProgressId, setModuleProgressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const initializeSession = async () => {
    try {
      setLoading(true);
      console.log("Initializing test session...");

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create a new test session
      const { data: session, error: sessionError } = await supabase
        .from("test_sessions")
        .insert({
          user_id: user.id,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      if (!session) throw new Error("Failed to create test session");

      console.log("Created test session:", session.id);
      setSessionId(session.id);
      
      // Get all modules ordered by order_index
      const { data: modules, error: moduleError } = await supabase
        .from("test_modules")
        .select("id, name")
        .order("order_index", { ascending: true });

      if (moduleError) throw moduleError;
      if (!modules || modules.length === 0) {
        throw new Error("No test modules available");
      }

      // Get the module at the specified index
      const currentModule = modules[currentModuleIndex];
      if (!currentModule) {
        throw new Error(`No module found at index: ${currentModuleIndex}`);
      }
      
      console.log("Initializing module progress for module:", currentModule.name);
      
      // Initialize first module progress
      const { data: moduleProgress, error: progressError } = await supabase
        .from("module_progress")
        .insert({
          session_id: session.id,
          module_id: currentModule.id,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (progressError) {
        console.error("Error creating module progress:", progressError);
        throw progressError;
      }

      if (!moduleProgress) {
        throw new Error("Failed to create module progress");
      }

      console.log("Initialized module progress:", moduleProgress.id);
      setModuleProgressId(moduleProgress.id);
      
    } catch (error: any) {
      console.error("Error initializing session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to initialize session"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeModule = async () => {
    if (!sessionId) {
      console.error("No active session");
      return;
    }

    try {
      console.log("Completing current module...");

      // Get current module progress
      const { data: currentProgress, error: progressError } = await supabase
        .from("module_progress")
        .select("id, module_id")
        .eq("session_id", sessionId)
        .is("completed_at", null)
        .limit(1)
        .order('created_at', { ascending: false })
        .single();

      if (progressError) throw progressError;
      if (!currentProgress) {
        throw new Error("No active module progress found");
      }

      // Mark current module as completed
      const { error: completeError } = await supabase
        .from("module_progress")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", currentProgress.id);

      if (completeError) throw completeError;

      // Get all modules ordered by order_index
      const { data: modules, error: modulesError } = await supabase
        .from("test_modules")
        .select("id")
        .order("order_index", { ascending: true });

      if (modulesError) throw modulesError;
      if (!modules || modules.length === 0) {
        throw new Error("No test modules available");
      }

      // Find current module index and check if there's a next one
      const currentIndex = modules.findIndex(m => m.id === currentProgress.module_id);
      const nextModule = modules[currentIndex + 1];

      // If there's a next module, initialize it
      if (nextModule) {
        const { data: nextProgress, error: nextProgressError } = await supabase
          .from("module_progress")
          .insert({
            session_id: sessionId,
            module_id: nextModule.id,
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (nextProgressError) throw nextProgressError;
        if (!nextProgress) throw new Error("Failed to create next module progress");
        
        setModuleProgressId(nextProgress.id);
        console.log("Initialized next module progress");
      } else {
        // If no next module, complete the session
        const { error: sessionError } = await supabase
          .from("test_sessions")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", sessionId);

        if (sessionError) throw sessionError;
        console.log("Completed test session");
        
        // Redirect to results page with session ID
        navigate(`/gat/simulator/results/${sessionId}`);
      }
      
    } catch (error: any) {
      console.error("Error completing module:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to complete module"
      });
    }
  };

  return {
    sessionId,
    moduleProgressId,
    loading,
    initializeSession,
    completeModule
  };
}
