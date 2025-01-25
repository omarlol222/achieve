import { useMemo } from "react";
import { TestSession } from "../types";

export function useSessionScores(session: TestSession | null) {
  const subjectScores = useMemo(() => {
    if (!session) return [];

    const subjects = [...new Set(
      session.module_progress
        ?.filter(progress => progress.module?.subject)
        .map(progress => progress.module.subject)
    )];

    const uniqueSubjects = subjects.filter((subject, index, self) =>
      index === self.findIndex((s) => s?.id === subject?.id)
    );

    return uniqueSubjects.map(subject => ({
      name: subject.name,
      score: calculateSubjectScore(subject.name, session)
    }));
  }, [session]);

  const totalScore = useMemo(() => {
    if (!subjectScores.length) return 0;
    return Math.round(
      subjectScores.reduce((sum, subject) => sum + subject.score, 0) / 
      subjectScores.length
    );
  }, [subjectScores]);

  return { subjectScores, totalScore };
}

function calculateSubjectScore(subjectName: string, session: TestSession) {
  if (!session?.module_progress) return 0;
  
  const name = subjectName.toLowerCase();
  const isVerbal = name === 'english' || name.includes('verbal');
  const isQuantitative = name === 'math' || name.includes('quant');
  
  if (!isVerbal && !isQuantitative) return 0;
  
  const relevantProgress = session.module_progress.filter((progress) => {
    const subjectLower = progress.module?.subject?.name.toLowerCase();
    return isVerbal ? 
      (subjectLower === 'english' || subjectLower.includes('verbal')) :
      (subjectLower === 'math' || subjectLower.includes('quant'));
  });

  if (relevantProgress.length === 0) return 0;

  const totalAnswers = relevantProgress.reduce((sum, progress) => 
    sum + (progress.module_answers?.length || 0), 0);

  if (totalAnswers === 0) return 0;

  const correctAnswers = relevantProgress.reduce((sum, progress) => {
    return sum + (progress.module_answers?.filter((answer) => 
      answer.selected_answer === answer.question.correct_answer
    ).length || 0);
  }, 0);

  return Math.round((correctAnswers / totalAnswers) * 100);
}