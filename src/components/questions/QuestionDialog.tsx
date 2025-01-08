import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QuestionFormFields } from "./QuestionFormFields";
import { QuestionFormData } from "@/types/question";

type QuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSuccess: () => void;
};

export function QuestionDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: QuestionDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuestionFormData>({
    defaultValues: initialData
      ? {
          question_text: initialData.question_text || "",
          choice1: initialData.choice1 || "",
          choice2: initialData.choice2 || "",
          choice3: initialData.choice3 || "",
          choice4: initialData.choice4 || "",
          correct_answer: String(initialData.correct_answer) || "1",
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
        }
      : {
          question_text: "",
          choice1: "",
          choice2: "",
          choice3: "",
          choice4: "",
          correct_answer: "1",
          difficulty: "Easy",
          topic_id: "",
          explanation: "",
          question_type: "normal",
          passage_text: "",
          test_type_id: "",
          image_url: "",
          explanation_image_url: "",
          comparison_value1: "",
          comparison_value2: "",
        },
  });

  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: topics } = useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*, subject:subjects(name)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: testTypes } = useQuery({
    queryKey: ["testTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const onSubmit = async (data: QuestionFormData) => {
    try {
      setIsSubmitting(true);
      const questionData = {
        ...data,
        correct_answer: parseInt(data.correct_answer),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Question" : "Add New Question"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <QuestionFormFields 
              form={form} 
              topics={topics || []} 
              subjects={subjects || []}
              testTypes={testTypes || []}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                  ? "Update Question"
                  : "Add Question"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}