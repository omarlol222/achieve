
import { useToast } from "@/hooks/use-toast";
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
  const validDifficulty = isValidDifficulty(difficulty) ? difficulty : 'Easy';
  
  const query = supabase
    .from('questions')
    .select('*')
    .eq('subtopic_id', subtopicId);

  if (answeredIds.length > 0) {
    query.not('id', 'in', answeredIds);
  }

  const { data: questions, error } = await query;
  
  if (error) {
    console.error("Error fetching questions:", error);
    return [];
  }

  return questions as PracticeQuestion[] || [];
}

export async function fetchFallbackQuestions(
  subtopicIds: string[],
  answeredIds: string[]
) {
  const query = supabase
    .from('questions')
    .select('*')
    .in('subtopic_id', subtopicIds)
    .limit(10);

  if (answeredIds.length > 0) {
    query.not('id', 'in', answeredIds);
  }

  const { data: questions, error } = await query;
  
  if (error) {
    console.error("Error fetching fallback questions:", error);
    return [];
  }

  return questions as PracticeQuestion[] || [];
}
