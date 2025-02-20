
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAnsweredQuestions(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["answered-questions", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from("practice_answers")
        .select("question_id")
        .eq("session_id", sessionId);

      if (error) throw error;
      return (data || []).map(a => a.question_id);
    },
    enabled: !!sessionId
  });
}
