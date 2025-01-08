import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";
import { ImageUploadField } from "./ImageUploadField";

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

      {questionType === "comparison" && (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="border-b p-2 text-center w-1/2">A</th>
                  <th className="border-b p-2 text-center w-1/2">B</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r p-4">
                    <FormField
                      control={form.control}
                      name="comparison_value1"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder="First Value" className="text-center" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </td>
                  <td className="p-4">
                    <FormField
                      control={form.control}
                      name="comparison_value2"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder="Second Value" className="text-center" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {(questionType === "normal" || questionType === "analogy") && (
        <>
          <ImageUploadField
            form={form}
            fieldName="image_url"
            label="Question Image (Optional)"
          />
          <ImageUploadField
            form={form}
            fieldName="explanation_image_url"
            label="Explanation Image (Optional)"
          />
        </>
      )}

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