import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

type QuestionFormData = {
  question_type: string;
  [key: string]: any;
};

type QuestionTypeFieldProps = {
  form: UseFormReturn<QuestionFormData>;
};

export function QuestionTypeField({ form }: QuestionTypeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="question_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Question Type</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="normal">Normal Question</SelectItem>
              <SelectItem value="passage">Passage-Based Question</SelectItem>
              <SelectItem value="analogy">Analogy Question</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}