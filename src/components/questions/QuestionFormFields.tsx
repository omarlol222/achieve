import { UseFormReturn } from "react-hook-form";
import { QuestionTypeField } from "./fields/QuestionTypeField";
import { TopicSelectionFields } from "./fields/TopicSelectionFields";
import { QuestionContentFields } from "./fields/QuestionContentFields";
import { AnswerFields } from "./fields/AnswerFields";
import { TestTypeField } from "./fields/TestTypeField";
import { QuestionFormData } from "@/types/question";

type QuestionFormFieldsProps = {
  form: UseFormReturn<QuestionFormData>;
  topics: any[];
  subjects: any[];
  testTypes: any[];
};

export function QuestionFormFields({ form, topics, subjects, testTypes }: QuestionFormFieldsProps) {
  return (
    <>
      <TestTypeField form={form} testTypes={testTypes} />
      <QuestionTypeField form={form} />
      <TopicSelectionFields form={form} topics={topics} subjects={subjects} />
      <QuestionContentFields form={form} />
      <AnswerFields form={form} />
    </>
  );
}