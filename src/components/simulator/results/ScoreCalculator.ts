import { supabase } from "@/integrations/supabase/client";

export const calculateSubjectScore = (
  moduleAnswers: any[],
  subjectId: string
) => {
  if (moduleAnswers.length === 0) return 0;

  const correctAnswers = moduleAnswers.filter(
    answer => answer.selected_answer === answer.question.correct_answer
  ).length;

  return Math.round((correctAnswers / moduleAnswers.length) * 100);
};

export const calculateTopicPerformance = (moduleProgress: any[]) => {
  if (!moduleProgress) return [];

  const topicStats: { [key: string]: { 
    name: string; 
    correct: number; 
    total: number;
    subjectId: string;
    subjectName: string;
  } } = {};

  moduleProgress.forEach(progress => {
    progress.module_answers?.forEach((answer: any) => {
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

export const updateSessionScores = async (
  sessionId: string,
  verbalScore: number,
  quantitativeScore: number,
  totalScore: number
) => {
  const { error } = await supabase
    .from("test_sessions")
    .update({
      verbal_score: verbalScore,
      quantitative_score: quantitativeScore,
      total_score: totalScore,
      completed_at: new Date().toISOString()
    })
    .eq("id", sessionId);

  if (error) throw error;
};