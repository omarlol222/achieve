import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QuestionFormData } from "@/types/question";

export function useQuestionSubmit(onSuccess: () => void, onOpenChange: (open: boolean) => void) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: QuestionFormData, initialData?: any) => {
    try {
      setIsSubmitting(true);
      const questionData = {
        ...data,
        correct_answer: parseInt(data.correct_answer),
        topic_id: data.topic_id || null,
        test_type_id: data.test_type_id || null,
        explanation: data.explanation || null,
        passage_text: data.passage_text || null,
        image_url: data.image_url || null,
        explanation_image_url: data.explanation_image_url || null,
        comparison_value1: data.comparison_value1 || null,
        comparison_value2: data.comparison_value2 || null,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from("questions")
          .update(questionData)
          .eq("id", initialData.id);
        if (error) throw error;
        toast({
          title: "Question updated successfully",
        });
      } else {
        const { error } = await supabase.from("questions").insert(questionData);
        if (error) throw error;
        toast({
          title: "Question created successfully",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
}