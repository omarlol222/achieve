import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuestionFormData } from "@/types/question";

export function useQuestionForm(initialData: any) {
  const form = useForm<QuestionFormData>({
    defaultValues: {
      question_text: initialData?.question_text || "",
      choice1: initialData?.choice1 || "",
      choice2: initialData?.choice2 || "",
      choice3: initialData?.choice3 || "",
      choice4: initialData?.choice4 || "",
      correct_answer: initialData?.correct_answer ? String(initialData.correct_answer) : "1",
      difficulty: initialData?.difficulty || "Easy",
      topic_id: initialData?.topic_id || "",
      explanation: initialData?.explanation || "",
      question_type: initialData?.question_type || "normal",
      passage_text: initialData?.passage_text || "",
      test_type_id: initialData?.test_type_id || "",
      image_url: initialData?.image_url || "",
      explanation_image_url: initialData?.explanation_image_url || "",
      comparison_value1: initialData?.comparison_value1 || "",
      comparison_value2: initialData?.comparison_value2 || "",
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        question_text: initialData.question_text || "",
        choice1: initialData.choice1 || "",
        choice2: initialData.choice2 || "",
        choice3: initialData.choice3 || "",
        choice4: initialData.choice4 || "",
        correct_answer: initialData.correct_answer ? String(initialData.correct_answer) : "1",
        difficulty: initialData.difficulty || "Easy",
        topic_id: initialData.topic_id || "",
        explanation: initialData.explanation || "",
        question_type: initialData.question_type || "normal",
        passage_text: initialData.passage_text || "",
        test_type_id: initialData.test_type_id || "",
        image_url: initialData.image_url || "",
        explanation_image_url: initialData.explanation_image_url || "",
        comparison_value1: initialData.comparison_value1 || "",
        comparison_value2: initialData.comparison_value2 || "",
      });
    }
  }, [initialData, form]);

  return form;
}