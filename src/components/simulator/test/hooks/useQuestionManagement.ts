import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useQuestionManagement(currentModuleIndex: number) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const loadModuleQuestions = async () => {
    try {
      const subjectName = currentModuleIndex === 0 ? "Verbal" : "Quantitative";
      
      const { data: questions, error } = await supabase
        .from("questions")
        .select(`
          *,
          topic:topics!topic_id (
            id,
            name,
            subject:subjects (
              id,
              name
            )
          )
        `)
        .eq("topic.subject.name", subjectName)
        .limit(20);

      if (error) throw error;
      setQuestions(questions || []);
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