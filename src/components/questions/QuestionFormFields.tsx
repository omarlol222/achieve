import { UseFormReturn } from "react-hook-form";
import { QuestionTypeField } from "./fields/QuestionTypeField";
import { TopicSelectionFields } from "./fields/TopicSelectionFields";
import { QuestionContentFields } from "./fields/QuestionContentFields";
import { AnswerFields } from "./fields/AnswerFields";

type QuestionFormData = {
  question_text: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correct_answer: string;
  difficulty: string;
  topic_id: string;
  explanation?: string;
  question_type: string;
  passage_text?: string;
};

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