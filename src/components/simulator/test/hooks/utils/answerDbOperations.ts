import { supabase } from "@/integrations/supabase/client";

export async function saveAnswer(
  moduleProgressId: string,
  questionId: string,
  answer: number,
  isFlagged: boolean
) {
  const { data: questionData } = await supabase
    .from("questions")
    .select("correct_answer")
    .eq("id", questionId)
    .maybeSingle();

  const isCorrect = questionData?.correct_answer === answer;

  const { data: existingAnswer } = await supabase
    .from("module_answers")
    .select("id")
    .eq("module_progress_id", moduleProgressId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (existingAnswer) {
    return supabase
      .from("module_answers")
      .update({
        selected_answer: answer,
        is_correct: isCorrect,
        is_flagged: isFlagged
      })
      .eq("id", existingAnswer.id);
  }

  return supabase
    .from("module_answers")
    .insert({
      module_progress_id: moduleProgressId,
      question_id: questionId,
      selected_answer: answer,
      is_correct: isCorrect,
      is_flagged: isFlagged
    });
}

export async function loadExistingAnswers(sessionId: string) {
  const { data: moduleProgressData, error: moduleError } = await supabase
    .from("module_progress")
    .select("id")
    .eq("session_id", sessionId)
    .is("completed_at", null)
    .maybeSingle();

  if (moduleError) {
    throw new Error(moduleError.message);
  }

  if (!moduleProgressData) {
    return { answers: {}, flagged: {}, moduleProgressId: null };
  }

  const { data: existingAnswers, error: answersError } = await supabase
    .from("module_answers")
    .select("question_id, selected_answer, is_flagged")
    .eq("module_progress_id", moduleProgressData.id);

  if (answersError) {
    throw new Error(answersError.message);
  }

  const answerMap: Record<string, number> = {};
  const flagMap: Record<string, boolean> = {};

  existingAnswers?.forEach(answer => {
    if (answer.question_id) {
      answerMap[answer.question_id] = answer.selected_answer;
      flagMap[answer.question_id] = answer.is_flagged || false;
    }
  });

  return {
    answers: answerMap,
    flagged: flagMap,
    moduleProgressId: moduleProgressData.id
  };
}