import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Difficulty = "Easy" | "Moderate" | "Hard";

export function useQuestionManagement(currentModuleIndex: number) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const loadModuleQuestions = async () => {
    try {
      console.log("Starting to load questions for module index:", currentModuleIndex);
      
      // Get the module configuration based on the order_index
      const { data: module, error: moduleError } = await supabase
        .from("test_modules")
        .select(`
          id,
          name,
          subject_id,
          test_type_id,
          difficulty_levels,
          module_topics (
            topic_id,
            percentage,
            question_count
          )
        `)
        .eq("order_index", currentModuleIndex)
        .single();

      if (moduleError) {
        console.error("Error fetching module:", moduleError);
        throw moduleError;
      }
      
      if (!module) {
        console.error("No module found for index:", currentModuleIndex);
        return;
      }

      console.log("Found module:", module);
      console.log("Module topics:", module.module_topics);

      // Validate and filter difficulty levels
      const validDifficulties = (module.difficulty_levels || []).filter(
        (level): level is Difficulty => 
          level === "Easy" || level === "Moderate" || level === "Hard"
      );

      if (validDifficulties.length === 0) {
        console.error("No valid difficulty levels found, using all difficulties");
        validDifficulties.push("Easy", "Moderate", "Hard");
      }

      // For each topic in the module, fetch the specified number of questions
      let allQuestions: any[] = [];
      
      for (const topicConfig of module.module_topics) {
        console.log("Fetching questions for topic config:", topicConfig);
        
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
            question_type,
            passage_text,
            comparison_value1,
            comparison_value2,
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
          .in("difficulty", validDifficulties as readonly Difficulty[])
          .limit(topicConfig.question_count);

        if (questionsError) {
          console.error("Error fetching questions for topic:", questionsError);
          throw questionsError;
        }
        
        if (topicQuestions) {
          console.log(`Found ${topicQuestions.length} questions for topic ${topicConfig.topic_id}`);
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
            question_type,
            passage_text,
            comparison_value1,
            comparison_value2,
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
          .in("difficulty", validDifficulties as readonly Difficulty[])
          .limit(20);

        if (defaultError) {
          console.error("Error fetching default questions:", defaultError);
          throw defaultError;
        }
        
        if (defaultQuestions) {
          console.log(`Found ${defaultQuestions.length} default questions`);
          allQuestions = defaultQuestions;
        }
      }

      // Shuffle the questions to randomize their order
      const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
      
      console.log("Final questions loaded:", shuffledQuestions.length);
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