import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";
import { ImageUploadField } from "../ImageUploadField";

type ExplanationFieldProps = {
  form: UseFormReturn<QuestionFormData>;
};

export function ExplanationField({ form }: ExplanationFieldProps) {
  return (
    <>
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
      <ImageUploadField
        form={form}
        fieldName="explanation_image_url"
        label="Explanation Image (Optional)"
      />
    </>
  );
}