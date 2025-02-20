
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
  
  // Fetch a batch of questions in one query
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .eq('subtopic_id', subtopicId)
    .eq('difficulty', validDifficulty)
    .not('id', 'in', answeredIds)
    .order('created_at')
    .limit(5); // Limit to reduce data transfer
  
  if (error) {
    console.error("Error fetching questions for subtopic:", error);
    return [];
  }

  return questions as PracticeQuestion[] || [];
}

export async function fetchFallbackQuestions(
  subtopicIds: string[],
  answeredIds: string[]
) {
  if (!subtopicIds.length) return [];

  // Fetch a diverse set of questions across different difficulties
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .in('subtopic_id', subtopicIds)
    .not('id', 'in', answeredIds)
    .order('created_at')
    .limit(10);
  
  if (error) {
    console.error("Error fetching fallback questions:", error);
    return [];
  }

  return questions as PracticeQuestion[] || [];
}
