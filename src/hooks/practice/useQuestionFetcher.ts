
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
  
  // Use a CTE (Common Table Expression) to select random questions
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .eq('subtopic_id', subtopicId)
    .eq('difficulty', validDifficulty)
    .not('id', answeredIds.length > 0 ? 'in' : 'eq', answeredIds)
    .limit(5);
  
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

  // Use a more specific query to avoid duplicates
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .in('subtopic_id', subtopicIds)
    .not('id', answeredIds.length > 0 ? 'in' : 'eq', answeredIds)
    .limit(10);
  
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
