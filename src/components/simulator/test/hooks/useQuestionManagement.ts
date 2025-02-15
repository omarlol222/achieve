
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
          .select(`
            id,
            subject_id,
            subject:subjects (
              id,
              name
            ),
            module_topics:module_topics (
              topic_id,
              percentage,
              question_count
            )
          `)
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

        // Get topic IDs for this module
        const moduleTopics = currentModule.module_topics || [];
        const topicIds = moduleTopics.map((mt: any) => mt.topic_id);

        if (!topicIds.length) {
          throw new Error("No topics configured for this module");
        }

        // Get questions for the current module with all the necessary filters
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
              comparison_value2,
              topic_id,
              difficulty
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
          
          // Get available questions based on module configuration
          const { data: availableQuestions, error: availableQuestionsError } = await supabase
            .from("questions")
            .select("*")
            .in("topic_id", topicIds)
            .eq("test_type_id", currentModule.test_type_id);

          if (availableQuestionsError) {
            throw new Error("Failed to fetch available questions");
          }

          if (!availableQuestions || availableQuestions.length === 0) {
            throw new Error("No questions available for this module's configuration");
          }

          // Calculate how many questions we need from each topic based on percentages
          const questionsByTopic = new Map();
          moduleTopics.forEach((mt: any) => {
            const topicQuestions = availableQuestions.filter(q => q.topic_id === mt.topic_id);
            const numQuestions = Math.min(mt.question_count, topicQuestions.length);
            
            // Randomly select the required number of questions
            const selectedQuestions = [...topicQuestions]
              .sort(() => 0.5 - Math.random())
              .slice(0, numQuestions);

            questionsByTopic.set(mt.topic_id, selectedQuestions);
          });

          // Insert selected questions into module_questions
          for (const [topicId, questions] of questionsByTopic.entries()) {
            for (const question of questions) {
              await supabase
                .from("module_questions")
                .insert({
                  module_id: currentModule.id,
                  question_id: question.id
                });
            }
          }

          // Fetch the newly created module questions
          const { data: newModuleQuestions, error: newQuestionsError } = await supabase
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
                comparison_value2,
                topic_id,
                difficulty
              )
            `)
            .eq("module_id", currentModule.id)
            .order("created_at", { ascending: true });

          if (newQuestionsError) throw newQuestionsError;
          if (!newModuleQuestions || newModuleQuestions.length === 0) {
            throw new Error("Failed to create module questions");
          }

          console.log(`Created ${newModuleQuestions.length} new module questions`);
          const formattedQuestions = newModuleQuestions
            .map(mq => mq.question)
            .filter((q): q is NonNullable<typeof q> => q !== null);

          setQuestions(formattedQuestions);
        } else {
          // Transform the nested data structure and filter out any null questions
          const formattedQuestions = moduleQuestions
            .map(mq => mq.question)
            .filter((q): q is NonNullable<typeof q> => q !== null);

          if (formattedQuestions.length === 0) {
            throw new Error("No valid questions found for this module");
          }

          console.log(`Loaded ${formattedQuestions.length} questions for module`);
          setQuestions(formattedQuestions);
        }
        
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
