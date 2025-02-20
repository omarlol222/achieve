
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["practice-session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      console.log("Fetching session:", sessionId);
      const { data, error } = await supabase
        .from("practice_sessions")
        .select(`
          *,
          practice_answers (
            points_earned
          )
        `)
        .eq("id", sessionId)
        .maybeSingle();

      if (error) {
        console.error("Session fetch error:", error);
        throw error;
      }
      console.log("Session data:", data);
      return data;
    },
    enabled: !!sessionId
  });
}
