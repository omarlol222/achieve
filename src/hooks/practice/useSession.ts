
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type SubtopicAttempts = {
  subtopics: string[];
};

type PracticeSession = {
  id: string;
  user_id: string;
  subject: string;
  total_questions: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  subtopic_attempts: SubtopicAttempts;
  questions_answered?: number;
  practice_answers?: Array<{ points_earned: number }>;
  completed_at?: string;
  created_at: string;
  current_streak?: number;
  session_points?: unknown;
};

type SupabaseSession = Omit<PracticeSession, 'subtopic_attempts'> & {
  subtopic_attempts: unknown;
};

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

      // Handle the conversion from Supabase JSON to our type
      const supabaseData = data as SupabaseSession;
      const sessionData: PracticeSession = {
        ...supabaseData,
        subtopic_attempts: supabaseData.subtopic_attempts as SubtopicAttempts
      };

      return sessionData;
    },
    enabled: !!sessionId
  });
}
