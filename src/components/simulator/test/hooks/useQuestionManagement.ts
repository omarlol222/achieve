
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

        // First check for existing module questions
        const { data: existingModuleQuestions, error: existingError } = await supabase
          .from("module_questions")
          .select(`
            id,
            module_id,
            question_id
          `)
          .eq("module_id", currentModule.id);

        if (existingError) {
          console.error("Error checking existing module questions:", existingError);
        } else {
          console.log(`Found ${existingModuleQuestions?.length || 0} existing module questions`);
        }

        // If no existing questions, fetch available questions and create new ones
        if (!existingModuleQuestions || existingModuleQuestions.length === 0) {
          console.log("No existing questions found, fetching available questions...");
          
          // Get available questions for this module's subject and topics
          const { data: availableQuestions, error: availableQuestionsError } = await supabase
            .from("questions")
            .select(`
              *,
              topics!inner (
                id,
                subject_id,
                name
              )
            `)
            .eq("topics.subject_id", currentModule.subject_id)
            .in("topic_id", topicIds)
            .eq("test_type_id", currentModule.test_type_id);

          if (availableQuestionsError) {
            console.error("Error fetching available questions:", availableQuestionsError);
            throw new Error("Failed to fetch available questions");
          }

          console.log(`Found ${availableQuestions?.length || 0} available questions for subject ${currentModule.subject?.name}`);

          if (!availableQuestions || availableQuestions.length === 0) {
            throw new Error(`No questions available for ${currentModule.subject?.name} subject and selected topics`);
          }

          // Group questions by topic and select required number for each
          const questionsByTopic = new Map();
          for (const mt of moduleTopics) {
            const topicQuestions = availableQuestions.filter(q => q.topic_id === mt.topic_id);
            console.log(`Topic ${mt.topic_id}: found ${topicQuestions.length} questions, need ${mt.question_count}`);
            
            const numQuestions = Math.min(mt.question_count, topicQuestions.length);
            const selectedQuestions = [...topicQuestions]
              .sort(() => 0.5 - Math.random())
              .slice(0, numQuestions);

            questionsByTopic.set(mt.topic_id, selectedQuestions);
            console.log(`Selected ${selectedQuestions.length} questions for topic ${mt.topic_id}`);
          }

          // Insert selected questions into module_questions
          for (const [topicId, questions] of questionsByTopic.entries()) {
            for (const question of questions) {
              const { error: insertError } = await supabase
                .from("module_questions")
                .insert({
                  module_id: currentModule.id,
                  question_id: question.id
                });
                
              if (insertError) {
                console.error(`Error inserting question for topic ${topicId}:`, insertError);
              }
            }
          }
        }

        // Fetch final module questions
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

        // Transform and filter questions
        const formattedQuestions = (moduleQuestions || [])
          .map(mq => mq.question)
          .filter((q): q is NonNullable<typeof q> => {
            const isValid = q !== null && q.topics.subject_id === currentModule.subject_id;
            if (!isValid) {
              console.log("Filtered out question:", {
                questionId: q?.id,
                topicSubjectId: q?.topics.subject_id,
                moduleSubjectId: currentModule.subject_id
              });
            }
            return isValid;
          });

        console.log(`Final questions count for ${currentModule.name}: ${formattedQuestions.length}`);
        
        if (formattedQuestions.length === 0) {
          throw new Error(`No valid questions found for module ${currentModule.name}`);
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
