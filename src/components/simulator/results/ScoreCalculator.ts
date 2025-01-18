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
  if (!session?.module_progress) return 0;
  
  const name = subjectName.toLowerCase();
  const isVerbal = name === 'english' || name.includes('verbal');
  const isQuantitative = name === 'math' || name.includes('quant');
  
  if (!isVerbal && !isQuantitative) return 0;
  
  const relevantProgress = session.module_progress.filter((progress: any) => {
    const subjectLower = progress.module?.subject?.name.toLowerCase();
    return isVerbal ? 
      (subjectLower === 'english' || subjectLower.includes('verbal')) :
      (subjectLower === 'math' || subjectLower.includes('quant'));
  });

  if (relevantProgress.length === 0) return 0;

  const totalAnswers = relevantProgress.reduce((sum: number, progress: any) => 
    sum + (progress.module_answers?.length || 0), 0);

  if (totalAnswers === 0) return 0;

  const correctAnswers = relevantProgress.reduce((sum: number, progress: any) => {
    return sum + (progress.module_answers?.filter((answer: any) => 
      answer.selected_answer === answer.question.correct_answer
    ).length || 0);
  }, 0);

  return Math.round((correctAnswers / totalAnswers) * 100);
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