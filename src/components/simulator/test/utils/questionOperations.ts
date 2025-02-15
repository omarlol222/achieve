
import { supabase } from "@/integrations/supabase/client";

export async function clearModuleQuestions(moduleId: string) {
  const { error } = await supabase
    .from("module_questions")
    .delete()
    .eq("module_id", moduleId);

  if (error) {
    throw new Error("Failed to reset module questions");
  }

  // Add a check to ensure deletion is complete
  const { data: remaining, error: checkError } = await supabase
    .from("module_questions")
    .select("id")
    .eq("module_id", moduleId);

  if (checkError) {
    throw new Error("Failed to verify module questions deletion");
  }

  if (remaining && remaining.length > 0) {
    throw new Error("Failed to clear existing module questions");
  }
}

export async function getTopicQuestions(moduleId: string, testTypeId: string, subjectId: string, topicId: string) {
  console.log("Fetching questions with params:", {
    moduleId,
    testTypeId,
    subjectId,
    topicId
  });

  // First verify the topic exists and get its details
  const { data: topicData, error: topicError } = await supabase
    .from("topics")
    .select(`
      id,
      name,
      subject_id,
      subjects!inner (
        id,
        name
      )
    `)
    .eq("id", topicId)
    .single();

  if (topicError || !topicData) {
    console.error("Failed to verify topic:", topicError);
    throw new Error(`Failed to verify topic ${topicId}`);
  }

  if (topicData.subject_id !== subjectId) {
    console.error("Topic subject mismatch:", {
      topic: topicData,
      expectedSubjectId: subjectId
    });
    throw new Error(`Topic ${topicId} does not belong to subject ${subjectId}`);
  }

  // Get all questions for this topic - simplified query to ensure we get all questions
  const { data: questions, error } = await supabase
    .from("questions")
    .select("*")
    .eq("topic_id", topicId)
    .eq("test_type_id", testTypeId);

  if (error) {
    console.error("Error fetching questions:", error);
    throw new Error(`Failed to fetch questions for topic ${topicId}`);
  }

  console.log("Raw question query results:", {
    topicName: topicData.name,
    totalQuestionsFound: questions?.length || 0,
    testTypeId,
    subjectId,
    topic: topicData,
    questions: questions
  });

  return questions || [];
}

export async function insertModuleQuestion(moduleId: string, questionId: string) {
  // First check if this combination already exists
  const { data: existing, error: checkError } = await supabase
    .from("module_questions")
    .select("id")
    .eq("module_id", moduleId)
    .eq("question_id", questionId)
    .maybeSingle();

  if (checkError) {
    throw new Error(`Failed to check existing question ${questionId}`);
  }

  // Only insert if the combination doesn't exist
  if (!existing) {
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
}

export async function getFinalModuleQuestions(moduleId: string) {
  const { data: moduleQuestions, error } = await supabase
    .from("module_questions")
    .select(`
      id,
      module_id,
      question:questions!inner (
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
          name
        )
      )
    `)
    .eq("module_id", moduleId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to load module questions");
  }

  const questions = moduleQuestions?.map(mq => mq.question) || [];
  console.log(`Retrieved ${questions.length} questions for module ${moduleId}`);
  return questions;
}
