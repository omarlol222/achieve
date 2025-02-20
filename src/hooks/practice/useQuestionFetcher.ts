
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PracticeQuestion } from "../usePracticeQuestions";

type DifficultyLevel = 'Easy' | 'Moderate' | 'Hard';

export async function fetchQuestionsForSubtopic(
  subtopicId: string,
  difficulty: DifficultyLevel,
  answeredIds: string[]
) {
  const query = supabase
    .from('questions')
    .select('*')
    .eq('subtopic_id', subtopicId)
    .eq('difficulty', difficulty);

  if (answeredIds.length > 0) {
    query.not('id', 'in', answeredIds);
  }

  const { data: questions } = await query;
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

  const { data: questions } = await query;
  return questions as PracticeQuestion[] || [];
}
