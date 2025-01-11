import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useModuleReviewData(moduleProgressId: string) {
  const { data: moduleProgress, isLoading: isLoadingProgress, error: progressError } = useQuery({
    queryKey: ["module-progress", moduleProgressId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_progress")
        .select(`
          *,
          module:test_modules (
            name,
            time_limit,
            subject:subjects (
              name
            )
          )
        `)
        .eq("id", moduleProgressId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Module progress not found");
      return data;
    },
  });

  const { data: answers, isLoading: isLoadingAnswers, error: answersError } = useQuery({
    queryKey: ["module-answers", moduleProgressId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_answers")
        .select(`
          *,
          question:questions (
            id,
            question_text,
            correct_answer,
            choice1,
            choice2,
            choice3,
            choice4,
            explanation,
            explanation_image_url,
            image_url,
            topic:topics (
              id,
              name
            )
          )
        `)
        .eq("module_progress_id", moduleProgressId);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No answers found for this module");
      return data;
    },
  });

  return {
    moduleProgress,
    answers,
    isLoading: isLoadingProgress || isLoadingAnswers,
    error: progressError || answersError
  };
}