import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";
import { PassageField } from "./question/PassageField";
import { ComparisonField } from "./question/ComparisonField";
import { QuestionTextField } from "./question/QuestionTextField";
import { ChoiceFields } from "./question/ChoiceFields";
import { ImageUploadField } from "./ImageUploadField";

type QuestionContentFieldsProps = {
  form: UseFormReturn<QuestionFormData>;
};

export function QuestionContentFields({ form }: QuestionContentFieldsProps) {
  const questionType = form.watch("question_type");

  return (
    <>
      {questionType === "passage" && <PassageField form={form} />}
      {questionType === "comparison" && <ComparisonField form={form} />}
      
      <QuestionTextField form={form} questionType={questionType} />

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

      <ChoiceFields form={form} />
    </>
  );
}