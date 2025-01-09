import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PracticeQuestion, Difficulty } from "@/types/practice";

export function usePracticeQuestions(
  topicId: string, 
  difficulty?: string, 
  questionCount: number = 10
) {
  return useQuery({
    queryKey: ["practice-questions", topicId, difficulty],
    queryFn: async () => {
      let query = supabase
        .from("questions")
        .select(`
          *,
          topic:topics (
            id,
            name
          )
        `)
        .eq("topic_id", topicId);

      if (difficulty && difficulty !== "all") {
        const validDifficulty = ["Easy", "Moderate", "Hard"].includes(difficulty) 
          ? (difficulty as Difficulty) 
          : undefined;
        
        if (validDifficulty) {
          query = query.eq("difficulty", validDifficulty);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data as PracticeQuestion[])
        .sort(() => Math.random() - 0.5)
        .slice(0, questionCount);
    },
  });
}