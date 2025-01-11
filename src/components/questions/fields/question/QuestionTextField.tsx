import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";

type QuestionTextFieldProps = {
  form: UseFormReturn<QuestionFormData>;
  questionType: string;
};

export function QuestionTextField({ form, questionType }: QuestionTextFieldProps) {
  return (
    <FormField
      control={form.control}
      name="question_text"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Question Text</FormLabel>
          <FormControl>
            <Textarea 
              {...field} 
              className={questionType === "analogy" ? "text-center" : ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}