import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";

type DifficultyFieldProps = {
  form: UseFormReturn<QuestionFormData>;
};

export function DifficultyField({ form }: DifficultyFieldProps) {
  return (
    <FormField
      control={form.control}
      name="difficulty"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Difficulty Level</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {['Easy', 'Moderate', 'Hard'].map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
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