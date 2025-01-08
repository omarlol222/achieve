import { UseFormReturn } from "react-hook-form";
import { QuestionTypeField } from "./fields/QuestionTypeField";
import { TopicSelectionFields } from "./fields/TopicSelectionFields";
import { QuestionContentFields } from "./fields/QuestionContentFields";
import { AnswerFields } from "./fields/AnswerFields";
import { QuestionFormData } from "@/types/question";

type QuestionFormFieldsProps = {
  form: UseFormReturn<QuestionFormData>;
  topics: any[];
  subjects: any[];
};

export function QuestionFormFields({ form, topics, subjects }: QuestionFormFieldsProps) {
  return (
    <>
      <QuestionTypeField form={form} />
      <TopicSelectionFields form={form} topics={topics} subjects={subjects} />
      <QuestionContentFields form={form} />
      <AnswerFields form={form} />
    </>
  );
}