
import { supabase } from "@/integrations/supabase/client";

export async function clearModuleQuestions(moduleId: string) {
  const { error } = await supabase
    .from("module_questions")
    .delete()
    .eq("module_id", moduleId);

  if (error) {
    throw new Error("Failed to reset module questions");
  }
}

export async function getTopicQuestions(moduleId: string, testTypeId: string, subjectId: string, topicId: string) {
  const { data: questions, error } = await supabase
    .from("questions")
    .select(`
      id,
      topic_id,
      test_type_id,
      topics!inner (
        id,
        subject_id,
        name
      )
    `)
    .eq("test_type_id", testTypeId)
    .eq("topics.subject_id", subjectId)
    .eq("topic_id", topicId);

  if (error) {
    throw new Error(`Failed to fetch questions for topic ${topicId}`);
  }

  return questions || [];
}

export async function insertModuleQuestion(moduleId: string, questionId: string) {
  const { error } = await supabase
    .from("module_questions")
    .insert({
      module_id: moduleId,
      question_id: questionId
    });

  if (error) {
    throw new Error(`Failed to insert question ${questionId}`);
  }
}

export async function getFinalModuleQuestions(moduleId: string) {
  const { data: moduleQuestions, error } = await supabase
    .from("module_questions")
    .select(`
      id,
      module_id,
      question:questions (
        id,
        question_text,
        choice1,
        choice2,
        choice3,
        choice4,
        correct_answer,
        image_url,
        explanation,
        explanation_image_url,
        question_type,
        passage_text,
        comparison_value1,
        comparison_value2,
        topic_id,
        difficulty,
        topics!inner (
          id,
          subject_id,
          name
        )
      )
    `)
    .eq("module_id", moduleId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to load module questions");
  }

  return moduleQuestions
    ?.map(mq => mq.question)
    .filter(q => q !== null) || [];
}
