
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
            name,
            subject_id,
            test_type_id,
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

        console.log("Current module:", {
          id: currentModule.id,
          name: currentModule.name,
          subject: currentModule.subject?.name,
          subjectId: currentModule.subject_id,
          topicsCount: currentModule.module_topics?.length
        });

        // Get topic IDs for this module
        const moduleTopics = currentModule.module_topics || [];

        console.log("Module topics configuration:", moduleTopics.map(mt => ({
          topicId: mt.topic_id,
          percentage: mt.percentage,
          questionCount: mt.question_count
        })));

        if (!moduleTopics.length) {
          throw new Error("No topics configured for this module");
        }

        // First, clear any existing module questions to ensure fresh selection
        const { error: deleteError } = await supabase
          .from("module_questions")
          .delete()
          .eq("module_id", currentModule.id);

        if (deleteError) {
          console.error("Error clearing existing module questions:", deleteError);
          throw new Error("Failed to reset module questions");
        }

        // Process each topic according to its configuration
        for (const topicConfig of moduleTopics) {
          // Fetch available questions for this specific topic
          const { data: topicQuestions, error: topicQuestionsError } = await supabase
            .from("questions")
            .select(`
              id,
              topic_id,
              test_type_id,
              topics!inner (
                id,
                subject_id,
                name
              )
            `)
            .eq("test_type_id", currentModule.test_type_id)
            .eq("topics.subject_id", currentModule.subject_id)
            .eq("topic_id", topicConfig.topic_id);

          if (topicQuestionsError) {
            console.error("Error fetching topic questions:", topicQuestionsError);
            continue;
          }

          if (!topicQuestions?.length) {
            console.warn(`No questions available for topic ${topicConfig.topic_id}`);
            continue;
          }

          console.log(`Found ${topicQuestions.length} questions for topic ${topicConfig.topic_id}`);

          // Select random questions based on the configured question count
          const selectedQuestions = [...topicQuestions]
            .sort(() => 0.5 - Math.random())
            .slice(0, topicConfig.question_count);

          // Insert selected questions into module_questions
          for (const question of selectedQuestions) {
            const { error: insertError } = await supabase
              .from("module_questions")
              .insert({
                module_id: currentModule.id,
                question_id: question.id
              });

            if (insertError) {
              console.error("Error inserting module question:", insertError);
            }
          }
        }

        // Fetch final module questions with full details
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
              difficulty,
              topics!inner (
                id,
                subject_id,
                name
              )
            )
          `)
          .eq("module_id", currentModule.id)
          .order("created_at", { ascending: true });

        if (questionsError) {
          console.error("Error fetching module questions:", questionsError);
          throw new Error("Failed to load module questions");
        }

        const formattedQuestions = moduleQuestions
          ?.map(mq => mq.question)
          .filter(q => q !== null);

        console.log(`Final questions count: ${formattedQuestions?.length || 0}`);

        if (!formattedQuestions?.length) {
          throw new Error(`No questions available for module ${currentModule.name}`);
        }

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
