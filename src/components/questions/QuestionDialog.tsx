import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
            <FormField
              control={form.control}
              name="topic_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topics?.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="question_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {[1, 2, 3, 4].map((num) => (
              <FormField
                key={num}
                control={form.control}
                name={`choice${num}` as keyof QuestionFormData}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choice {num}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <FormField
              control={form.control}
              name="correct_answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correct Answer</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4].map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          Choice {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <SelectItem key={level} value={String(level)}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explanation (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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