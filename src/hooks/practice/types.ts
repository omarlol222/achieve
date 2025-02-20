
export type PracticeQuestion = {
  id: string;
  question_text: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correct_answer: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  image_url?: string;
  explanation?: string;
  explanation_image_url?: string;
  question_type: 'normal' | 'passage' | 'analogy' | 'comparison';
  passage_text?: string;
  comparison_value1?: string;
  comparison_value2?: string;
  subtopic_id?: string;
};
