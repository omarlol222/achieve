
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
  console.log(`Fetching questions for subtopic ${subtopicId} with difficulty ${difficulty}`);
  
  const validDifficulty = isValidDifficulty(difficulty) ? difficulty : 'Easy';
  
  let query = supabase
    .from('questions')
    .select('*')
    .eq('subtopic_id', subtopicId)
    .order('created_at');

  if (answeredIds.length > 0) {
    query = query.not('id', 'in', answeredIds);
  }

  const { data: questions, error } = await query;
  
  if (error) {
    console.error("Error fetching questions for subtopic:", error);
    return [];
  }

  console.log(`Found ${questions?.length || 0} questions for subtopic ${subtopicId}`);
  return questions as PracticeQuestion[] || [];
}

export async function fetchFallbackQuestions(
  subtopicIds: string[],
  answeredIds: string[]
) {
  console.log("Fetching fallback questions for subtopics:", subtopicIds);
  
  if (!subtopicIds.length) {
    console.log("No subtopic IDs provided for fallback");
    return [];
  }

  let query = supabase
    .from('questions')
    .select('*')
    .in('subtopic_id', subtopicIds)
    .order('created_at')
    .limit(10);

  if (answeredIds.length > 0) {
    query = query.not('id', 'in', answeredIds);
  }

  const { data: questions, error } = await query;
  
  if (error) {
    console.error("Error fetching fallback questions:", error);
    return [];
  }

  console.log(`Found ${questions?.length || 0} fallback questions`);
  return questions as PracticeQuestion[] || [];
}
