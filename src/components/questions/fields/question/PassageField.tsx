import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";

type PassageFieldProps = {
  form: UseFormReturn<QuestionFormData>;
};

export function PassageField({ form }: PassageFieldProps) {
  return (
    <FormField
      control={form.control}
      name="passage_text"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Passage Text</FormLabel>
          <FormControl>
            <Textarea {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}