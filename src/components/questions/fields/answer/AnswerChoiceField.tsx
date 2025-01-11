import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";

type AnswerChoiceFieldProps = {
  form: UseFormReturn<QuestionFormData>;
};

export function AnswerChoiceField({ form }: AnswerChoiceFieldProps) {
  return (
    <FormField
      control={form.control}
      name="correct_answer"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Correct Answer</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
  );
}