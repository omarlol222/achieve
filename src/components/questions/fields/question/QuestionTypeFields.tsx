import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QuestionTypeFieldsProps = {
  form: UseFormReturn<QuestionFormData>;
};

export function QuestionTypeFields({ form }: QuestionTypeFieldsProps) {
  return (
    <FormField
      control={form.control}
      name="question_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Question Type</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="passage">Passage</SelectItem>
                <SelectItem value="analogy">Analogy</SelectItem>
                <SelectItem value="comparison">Comparison</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}