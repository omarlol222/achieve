export type TestModuleFormData = {
  name: string;
  description: string;
  time_limit: number;
  subject_id: string;
  test_type_id: string;
  topic_percentages: {
    [key: string]: number;
  };
  total_questions: number;
};