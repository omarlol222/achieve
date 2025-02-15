
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { selectModuleQuestions } from "./useQuestionSelection";

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
        setQuestions([]); // Clear existing questions before loading new ones
        
        const selectedQuestions = await selectModuleQuestions(
          currentModuleIndex,
          (errorMessage) => {
            setError(errorMessage);
            toast({
              variant: "destructive",
              title: "Error",
              description: errorMessage
            });
          }
        );

        if (selectedQuestions.length > 0) {
          console.log(`Loaded ${selectedQuestions.length} questions for module ${currentModuleIndex}`);
          setQuestions(selectedQuestions);
          setCurrentQuestionIndex(0);
        }
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

    // Reset state and load new questions whenever module index changes
    setCurrentQuestionIndex(0);
    loadQuestions();
  }, [currentModuleIndex, toast]); // Add currentModuleIndex as a dependency

  return {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    loading,
    error
  };
}
