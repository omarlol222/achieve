import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useModuleQuestions = (moduleId: string) => {
  return useQuery({
    queryKey: ["module-questions", moduleId],
    queryFn: async () => {
      console.log("Fetching questions for module:", moduleId);
      
      const { data: moduleQuestions, error } = await supabase
        .from('module_questions')
        .select(`
          id,
          module_id,
          question:questions (
            id,
            question_text,
            choice1,
            choice2,
            choice3,
            choice4,
            correct_answer,
            question_type,
            comparison_value1,
            comparison_value2,
            image_url,
            explanation,
            passage_text,
            explanation_image_url
          )
        `)
        .eq('module_id', moduleId)
        .order('id');

      if (error) {
        console.error("Error fetching module questions:", error);
        throw error;
      }

      if (!moduleQuestions?.length) {
        console.log("No questions found for module");
        return [];
      }

      // Transform the data to match the expected format
      const transformedQuestions = moduleQuestions
        .filter(mq => mq.question) // Filter out any null questions
        .map(mq => ({
          ...mq.question,
          module_question_id: mq.id
        }));

      console.log("Fetched questions:", transformedQuestions.length);
      return transformedQuestions;
    },
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};