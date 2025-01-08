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

type QuestionFormData = {
  question_text: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correct_answer: string;
  difficulty: string;
  topic_id: string;
  explanation?: string;
};

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
          ...initialData,
          correct_answer: String(initialData.correct_answer),
          difficulty: String(initialData.difficulty),
        }
      : {
          question_text: "",
          choice1: "",
          choice2: "",
          choice3: "",
          choice4: "",
          correct_answer: "1",
          difficulty: "1",
          topic_id: "",
          explanation: "",
        },
  });

  const { data: topics } = useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
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
        difficulty: parseInt(data.difficulty),
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
            <QuestionFormFields form={form} topics={topics || []} />

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