
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
        const topicIds = moduleTopics.map((mt: any) => mt.topic_id);

        console.log("Module topics:", moduleTopics.map(mt => ({
          topicId: mt.topic_id,
          percentage: mt.percentage,
          questionCount: mt.question_count
        })));

        if (!topicIds.length) {
          throw new Error("No topics configured for this module");
        }

        // Fetch available questions first to ensure we have questions before proceeding
        const { data: availableQuestions, error: availableQuestionsError } = await supabase
          .from("questions")
          .select(`
            id,
            topic_id,
            test_type_id
          `)
          .eq("test_type_id", currentModule.test_type_id)
          .in("topic_id", topicIds);

        if (availableQuestionsError) {
          console.error("Error checking available questions:", availableQuestionsError);
          throw new Error("Failed to check available questions");
        }

        console.log(`Found ${availableQuestions?.length || 0} available questions`);

        // Initialize module questions if none exist
        const { data: existingModuleQuestions, error: existingError } = await supabase
          .from("module_questions")
          .select("*")
          .eq("module_id", currentModule.id);

        if (existingError) {
          console.error("Error checking existing module questions:", existingError);
          throw new Error("Failed to check existing module questions");
        }

        if (!existingModuleQuestions?.length && availableQuestions?.length) {
          console.log("Initializing module questions...");
          
          // Group questions by topic
          const questionsByTopic = availableQuestions.reduce((acc, q) => {
            if (!acc[q.topic_id]) acc[q.topic_id] = [];
            acc[q.topic_id].push(q);
            return acc;
          }, {} as Record<string, any[]>);

          // Insert questions for each topic based on module_topics configuration
          for (const mt of moduleTopics) {
            const topicQuestions = questionsByTopic[mt.topic_id] || [];
            const numQuestions = Math.min(mt.question_count, topicQuestions.length);
            
            if (numQuestions > 0) {
              const selectedQuestions = [...topicQuestions]
                .sort(() => 0.5 - Math.random())
                .slice(0, numQuestions);

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
              topics (
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
