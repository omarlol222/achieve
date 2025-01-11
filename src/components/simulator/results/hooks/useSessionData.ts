import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSessionData(sessionId: string) {
  return useQuery({
    queryKey: ["test-session", sessionId],
    queryFn: async () => {
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
        .single();

      if (error) {
        console.error("Error fetching session:", error);
        throw error;
      }
      console.log("Session data:", data);
      return data;
    },
  });
}