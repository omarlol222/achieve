
import { supabase } from "@/integrations/supabase/client";
import { PracticeQuestion } from "../usePracticeQuestions";

type DifficultyLevel = 'Easy' | 'Moderate' | 'Hard';

const isValidDifficulty = (difficulty: string | null | undefined): difficulty is DifficultyLevel => {
  return difficulty === 'Easy' || difficulty === 'Moderate' || difficulty === 'Hard';
};

export async function fetchQuestionsForSubtopic(
  subtopicId: string,
  difficulty: string,
  answeredIds: string[]
) {
  console.log(`Fetching questions for subtopic ${subtopicId} with difficulty ${difficulty}`);
  
  const validDifficulty = isValidDifficulty(difficulty) ? difficulty : 'Easy';
  
  let query = supabase
    .from('questions')
    .select('*')
    .eq('subtopic_id', subtopicId)
    .eq('difficulty', validDifficulty);

  // Only apply the filter if there are answered questions
  if (answeredIds.length > 0) {
    query = query.not('id', 'in', answeredIds);
  }

  const { data: questions, error } = await query.limit(5);
  
  if (error) {
    console.error("Error fetching questions for subtopic:", error);
    return [];
  }

  // Filter out any potential duplicates by ID
  const uniqueQuestions = questions?.filter((question, index, self) =>
    index === self.findIndex((q) => q.id === question.id)
  );

  return uniqueQuestions as PracticeQuestion[] || [];
}

export async function fetchFallbackQuestions(
  subtopicIds: string[],
  answeredIds: string[]
) {
  if (!subtopicIds.length) return [];

  let query = supabase
    .from('questions')
    .select('*')
    .in('subtopic_id', subtopicIds);

  // Only apply the filter if there are answered questions
  if (answeredIds.length > 0) {
    query = query.not('id', 'in', answeredIds);
  }

  const { data: questions, error } = await query.limit(10);
  
  if (error) {
    console.error("Error fetching fallback questions:", error);
    return [];
  }

  // Filter out any potential duplicates by ID
  const uniqueQuestions = questions?.filter((question, index, self) =>
    index === self.findIndex((q) => q.id === question.id)
  );

  // Sort randomly to avoid getting the same sequence
  return uniqueQuestions?.sort(() => Math.random() - 0.5) as PracticeQuestion[] || [];
}
