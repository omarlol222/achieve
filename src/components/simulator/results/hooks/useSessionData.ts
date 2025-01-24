import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSessionData(sessionId: string) {
  return useQuery({
    queryKey: ["test-session", sessionId],
    queryFn: async () => {
      // Validate sessionId format
      if (!sessionId || sessionId === ":sessionId") {
        console.error("Invalid session ID:", sessionId);
        throw new Error("Invalid session ID");
      }

      console.log("Fetching session:", sessionId);
      const { data, error } = await supabase
        .from("test_sessions")
        .select(`
          *,
          module_progress:module_progress (
            id,
            module:test_modules (
              id,
              name,
              test_type:test_types (
                id,
                name
              ),
              subject:subjects (
                id,
                name
              )
            ),
            module_answers:module_answers (
              id,
              selected_answer,
              question:questions (
                id,
                correct_answer,
                topic:topics (
                  id,
                  name,
                  subject:subjects (
                    id,
                    name
                  )
                )
              )
            )
          )
        `)
        .eq("id", sessionId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching session:", error);
        throw error;
      }

      if (!data) {
        console.log("No session found for ID:", sessionId);
        return null;
      }

      console.log("Session data:", data);
      return data;
    },
    enabled: !!sessionId && sessionId !== ":sessionId",
  });
}