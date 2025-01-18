import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useQuestionManagement(currentModuleIndex: number) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Loading questions for module index:", currentModuleIndex);

        // First get the module at the specified index
        const { data: modules, error: modulesError } = await supabase
          .from("test_modules")
          .select("id")
          .order("order_index", { ascending: true });

        if (modulesError) {
          console.error("Error fetching modules:", modulesError);
          throw new Error("Failed to load test modules");
        }

        if (!modules || modules.length === 0) {
          console.error("No test modules found");
          throw new Error("No test modules available");
        }

        // Get the module at the specified index
        const currentModule = modules[currentModuleIndex];
        if (!currentModule) {
          console.error("No module found at index:", currentModuleIndex);
          throw new Error(`No module found at position ${currentModuleIndex + 1}`);
        }

        console.log("Found module:", currentModule.id);

        // Get questions for the current module with a proper join
        const { data: moduleQuestions, error: questionsError } = await supabase
          .from("module_questions")
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
              image_url,
              explanation,
              explanation_image_url,
              question_type,
              passage_text,
              comparison_value1,
              comparison_value2
            )
          `)
          .eq("module_id", currentModule.id)
          .order("created_at", { ascending: true });

        if (questionsError) {
          console.error("Error fetching module questions:", questionsError);
          throw new Error("Failed to load module questions");
        }

        if (!moduleQuestions || moduleQuestions.length === 0) {
          console.error("No questions found for module:", currentModule.id);
          throw new Error("No questions available for this module");
        }

        // Transform the nested data structure and filter out any null questions
        const formattedQuestions = moduleQuestions
          .map(mq => mq.question)
          .filter((q): q is NonNullable<typeof q> => q !== null);

        if (formattedQuestions.length === 0) {
          throw new Error("No valid questions found for this module");
        }

        console.log(`Loaded ${formattedQuestions.length} questions for module`);
        setQuestions(formattedQuestions);
        setCurrentQuestionIndex(0);
      } catch (err: any) {
        console.error("Error loading questions:", err);
        setError(err.message || "Failed to load questions");
        setQuestions([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Failed to load questions"
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [currentModuleIndex, toast]);

  return {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    loading,
    error
  };
}