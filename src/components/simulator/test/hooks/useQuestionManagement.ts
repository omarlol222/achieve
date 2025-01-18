import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useQuestionManagement(currentModuleIndex: number) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadModuleQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Starting to load questions for module index:", currentModuleIndex);
      
      // Get all modules ordered by order_index
      const { data: modules, error: moduleError } = await supabase
        .from("test_modules")
        .select("id")
        .order('order_index', { ascending: true });

      if (moduleError) {
        console.error("Error fetching modules:", moduleError);
        setError("Failed to load modules");
        return;
      }

      if (!modules || modules.length === 0) {
        console.error("No modules found");
        setError("No modules available");
        return;
      }

      // Get the module at the specified index
      const module = modules[currentModuleIndex];
      if (!module) {
        console.error("No module found at index:", currentModuleIndex);
        setError(`No module found at position ${currentModuleIndex + 1}`);
        return;
      }

      console.log("Found module ID:", module.id);

      // Get questions for this module through module_questions junction table
      const { data: moduleQuestions, error: questionsError } = await supabase
        .from("module_questions")
        .select(`
          question:questions (
            id,
            question_text,
            choice1,
            choice2,
            choice3,
            choice4,
            correct_answer,
            image_url,
            question_type,
            passage_text,
            comparison_value1,
            comparison_value2,
            topic:topics (
              id,
              name,
              subject:subjects (
                id,
                name
              )
            )
          )
        `)
        .eq('module_id', module.id);

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        setError("Failed to load questions");
        return;
      }

      // Transform the nested data structure and filter out null values
      const validQuestions = moduleQuestions
        ?.map(mq => mq.question)
        .filter((q): q is NonNullable<typeof q> => q !== null);

      console.log(`Loaded ${validQuestions?.length || 0} questions for module`);
      
      if (!validQuestions || validQuestions.length === 0) {
        setError("No questions available for this module");
        return;
      }

      // Shuffle the questions
      const shuffledQuestions = [...validQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);
      
    } catch (err: any) {
      console.error("Error loading questions:", err);
      setError(err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModuleQuestions();
  }, [currentModuleIndex]);

  return {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    loadModuleQuestions,
    loading,
    error
  };
}