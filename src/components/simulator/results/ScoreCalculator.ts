type ModuleAnswer = {
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

type ModuleProgress = {
  module: {
    subject?: {
      id: string;
      name: string;
    };
  };
  module_answers?: ModuleAnswer[];
};

export const calculateSubjectScore = (subjectName: string, session: any) => {
  const name = subjectName.toLowerCase();
  
  // Return the scores directly from the session object
  if (name === 'math' || name.includes('quant')) {
    return session.quantitative_score || 0;
  } else if (name === 'english' || name.includes('verbal')) {
    return session.verbal_score || 0;
  }
  
  return 0;
};

export const calculateTopicPerformance = (moduleProgress: ModuleProgress[]) => {
  if (!moduleProgress) return [];

  const topicStats: { [key: string]: { 
    name: string; 
    correct: number; 
    total: number;
    subjectId: string;
    subjectName: string;
  } } = {};

  moduleProgress.forEach(progress => {
    progress.module_answers?.forEach(answer => {
      if (!answer.question.topic) return;
      
      const topicId = answer.question.topic.id;
      const topicName = answer.question.topic.name;
      const subjectId = answer.question.topic.subject?.id || '';
      const subjectName = answer.question.topic.subject?.name || 'Uncategorized';
      
      if (!topicStats[topicId]) {
        topicStats[topicId] = { 
          name: topicName, 
          correct: 0, 
          total: 0,
          subjectId,
          subjectName
        };
      }
      
      topicStats[topicId].total++;
      if (answer.selected_answer === answer.question.correct_answer) {
        topicStats[topicId].correct++;
      }
    });
  });

  return Object.values(topicStats);
};