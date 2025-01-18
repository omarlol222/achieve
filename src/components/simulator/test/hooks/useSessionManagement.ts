import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useSessionManagement(currentModuleIndex: number) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const initializeSession = async () => {
    try {
      setLoading(true);
      console.log("Initializing test session...");

      // Create a new test session
      const { data: session, error: sessionError } = await supabase
        .from("test_sessions")
        .insert({})
        .select()
        .single();

      if (sessionError) throw sessionError;
      if (!session) throw new Error("Failed to create test session");

      console.log("Created test session:", session.id);
      setSessionId(session.id);
      
      // Get the first module ID
      const { data: module, error: moduleError } = await supabase
        .from("test_modules")
        .select("id")
        .eq("order_index", currentModuleIndex)
        .maybeSingle();

      if (moduleError) throw moduleError;
      if (!module) {
        throw new Error(`No module found with order index: ${currentModuleIndex}`);
      }
      
      // Initialize first module progress
      const { error: progressError } = await supabase
        .from("module_progress")
        .insert({
          session_id: session.id,
          module_id: module.id,
          started_at: new Date().toISOString()
        });

      if (progressError) throw progressError;
      
      console.log("Initialized first module progress");
      setLoading(false);
    } catch (error: any) {
      console.error("Error initializing session:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
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
      const { data: currentModule, error: currentModuleError } = await supabase
        .from("test_modules")
        .select("id")
        .eq("order_index", currentModuleIndex)
        .maybeSingle();

      if (currentModuleError) throw currentModuleError;
      if (!currentModule) {
        throw new Error(`No module found with order index: ${currentModuleIndex}`);
      }

      // Mark current module as completed
      const { error: completeError } = await supabase
        .from("module_progress")
        .update({ completed_at: new Date().toISOString() })
        .eq("session_id", sessionId)
        .eq("module_id", currentModule.id);

      if (completeError) throw completeError;

      // Check if there's a next module
      const { data: nextModule, error: nextModuleError } = await supabase
        .from("test_modules")
        .select("id")
        .eq("order_index", currentModuleIndex + 1)
        .maybeSingle();

      if (nextModuleError) throw nextModuleError;

      // If there's a next module, initialize it
      if (nextModule) {
        const { error: nextProgressError } = await supabase
          .from("module_progress")
          .insert({
            session_id: sessionId,
            module_id: nextModule.id,
            started_at: new Date().toISOString()
          });

        if (nextProgressError) throw nextProgressError;
        console.log("Initialized next module progress");
      } else {
        // If no next module, complete the session
        const { error: sessionError } = await supabase
          .from("test_sessions")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", sessionId);

        if (sessionError) throw sessionError;
        console.log("Completed test session");
      }
    } catch (error: any) {
      console.error("Error completing module:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  return {
    sessionId,
    loading,
    initializeSession,
    completeModule
  };
}