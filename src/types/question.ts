export type QuestionFormData = {
  question_text: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correct_answer: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  topic_id: string;
  explanation?: string;
  question_type: string;
  passage_text?: string;
  test_type_id: string;
  image_url?: string;
  explanation_image_url?: string;
};