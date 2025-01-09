export type Difficulty = "Easy" | "Moderate" | "Hard";

export type PracticeQuestion = {
  id: string;
  question_text: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correct_answer: number;
  explanation?: string;
  question_type: string;
  comparison_value1?: string;
  comparison_value2?: string;
  image_url?: string;
  topic_id: string;
};

export type PracticeState = {
  topicId: string;
  difficulty?: Difficulty | "all";
  questionCount: number;
};