import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useModuleQuestions = (moduleId: string) => {
  return useQuery({
    queryKey: ["module-questions", moduleId],
    queryFn: async () => {
      console.log("Fetching questions for module:", moduleId);
      
      // First, get the existing questions for this module
      const { data: existingQuestions, error: existingError } = await supabase
        .from("module_questions")
        .select("question_id")
        .eq("module_id", moduleId);

      if (existingError) throw existingError;

      if (!existingQuestions?.length) {
        throw new Error("No questions found for this module");
      }

      const questionIds = existingQuestions.map(q => q.question_id);
      
      // Then fetch the full question details
      const { data: questions, error: questionsError } = await supabase
        .from("questions")
        .select(`
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
          passage_text
        `)
        .in('id', questionIds);

      if (questionsError) throw questionsError;
      
      // Shuffle the questions
      return questions?.sort(() => Math.random() - 0.5) || [];
    },
  });
};