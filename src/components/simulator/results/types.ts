export type TestSession = {
  id: string;
  created_at: string;
  module_progress?: ModuleProgress[];
};

export type ModuleProgress = {
  id: string;
  module: {
    name: string;
    subject?: {
      id: string;
      name: string;
    };
    test_type?: {
      name: string;
    };
  };
  module_answers?: ModuleAnswer[];
};

export type ModuleAnswer = {
  id: string;
  selected_answer: number;
  question: {
    correct_answer: number;
    topic?: {
      id: string;
      name: string;
      subject?: {
        id: string;
        name: string;
      };
    };
  };
};

export type TopicStats = {
  name: string;
  correct: number;
  total: number;
  subjectId: string;
  subjectName: string;
};