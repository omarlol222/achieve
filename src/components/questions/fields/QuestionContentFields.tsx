import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";

type QuestionContentFieldsProps = {
  form: UseFormReturn<QuestionFormData>;
};

export function QuestionContentFields({ form }: QuestionContentFieldsProps) {
  const questionType = form.watch("question_type");

  return (
    <>
      {questionType === "passage" && (
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
      )}

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