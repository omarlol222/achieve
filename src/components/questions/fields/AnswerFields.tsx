import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";
import { AnswerChoiceField } from "./answer/AnswerChoiceField";
import { DifficultyField } from "./answer/DifficultyField";
import { ExplanationField } from "./answer/ExplanationField";

type AnswerFieldsProps = {
  form: UseFormReturn<QuestionFormData>;
};

export function AnswerFields({ form }: AnswerFieldsProps) {
  return (
    <>
      <AnswerChoiceField form={form} />
      <DifficultyField form={form} />
      <ExplanationField form={form} />
    </>
  );
}