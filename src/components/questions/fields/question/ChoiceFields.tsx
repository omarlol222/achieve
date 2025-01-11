import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";

type ChoiceFieldsProps = {
  form: UseFormReturn<QuestionFormData>;
};

export function ChoiceFields({ form }: ChoiceFieldsProps) {
  return (
    <>
      {["choice1", "choice2", "choice3", "choice4"].map((choiceName) => (
        <FormField
          key={choiceName}
          control={form.control}
          name={choiceName as keyof QuestionFormData}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choice {choiceName.slice(-1)}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </>
  );
}