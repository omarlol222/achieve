import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useQuestionManagement(currentModuleIndex: number) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const loadModuleQuestions = async () => {
    try {
      console.log("Loading questions for module index:", currentModuleIndex);
      
      // Get the module configuration based on the order_index
      const { data: module, error: moduleError } = await supabase
        .from("test_modules")
        .select(`
          id,
          subject_id,
          test_type_id,
          module_topics (
            topic_id,
            percentage,
            question_count
          )
        `)
        .eq("order_index", currentModuleIndex)
        .single();

      if (moduleError) throw moduleError;
      
      if (!module) {
        console.error("No module found for index:", currentModuleIndex);
        return;
      }

      console.log("Found module:", module);

      // For each topic in the module, fetch the specified number of questions
      let allQuestions: any[] = [];
      
      for (const topicConfig of module.module_topics) {
        const { data: topicQuestions, error: questionsError } = await supabase
          .from("questions")
          .select(`
            id,
            question_text,
            choice1,
            choice2,
            choice3,
            choice4,
            correct_answer,
            image_url,
            topic:topics!topic_id (
              id,
              name,
              subject:subjects (
                id,
                name
              )
            )
          `)
          .eq("topic_id", topicConfig.topic_id)
          .eq("test_type_id", module.test_type_id)
          .limit(topicConfig.question_count);

        if (questionsError) throw questionsError;
        
        if (topicQuestions) {
          allQuestions = [...allQuestions, ...topicQuestions];
        }
      }

      // If no questions were found, try to get default questions based on subject
      if (allQuestions.length === 0) {
        console.log("No topic-specific questions found, fetching default questions");
        const { data: defaultQuestions, error: defaultError } = await supabase
          .from("questions")
          .select(`
            id,
            question_text,
            choice1,
            choice2,
            choice3,
            choice4,
            correct_answer,
            image_url,
            topic:topics!topic_id (
              id,
              name,
              subject:subjects (
                id,
                name
              )
            )
          `)
          .eq("topic.subject_id", module.subject_id)
          .eq("test_type_id", module.test_type_id)
          .limit(20);

        if (defaultError) throw defaultError;
        
        if (defaultQuestions) {
          allQuestions = defaultQuestions;
        }
      }

      // Shuffle the questions to randomize their order
      const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
      
      console.log("Loaded questions:", shuffledQuestions.length);
      setQuestions(shuffledQuestions);
    } catch (err: any) {
      console.error("Error loading questions:", err);
    }
  };

  useEffect(() => {
    loadModuleQuestions();
  }, [currentModuleIndex]);

  return {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    loadModuleQuestions
  };
}