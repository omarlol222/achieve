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

        // First get all modules ordered by order_index
        const { data: modules, error: modulesError } = await supabase
          .from("test_modules")
          .select("id")
          .order("order_index", { ascending: true });

        if (modulesError) throw modulesError;
        if (!modules || modules.length === 0) {
          throw new Error("No test modules found");
        }

        // Get the module at the specified index
        const currentModule = modules[currentModuleIndex];
        if (!currentModule) {
          throw new Error(`No module found at index: ${currentModuleIndex}`);
        }

        // Get questions for the current module
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
              explanation,
              question_type,
              passage_text,
              comparison_value1,
              comparison_value2
            )
          `)
          .eq("module_id", currentModule.id)
          .order("created_at", { ascending: true });

        if (questionsError) throw questionsError;
        
        if (!moduleQuestions || moduleQuestions.length === 0) {
          throw new Error("No questions found for this module");
        }

        // Transform the nested data structure
        const formattedQuestions = moduleQuestions
          .map(mq => mq.question)
          .filter(q => q !== null);

        setQuestions(formattedQuestions);
        setCurrentQuestionIndex(0);
      } catch (err: any) {
        console.error("Error loading questions:", err);
        setError(err.message || "Failed to load questions");
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