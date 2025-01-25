import { ModuleProgress } from "./types";

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