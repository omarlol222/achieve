
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

  // First verify the topic belongs to the correct subject
  const { data: topicData, error: topicError } = await supabase
    .from("topics")
    .select("subject_id")
    .eq("id", topicId)
    .single();

  if (topicError || !topicData) {
    throw new Error(`Failed to verify topic ${topicId}`);
  }

  if (topicData.subject_id !== subjectId) {
    console.error("Topic subject mismatch:", {
      topicSubject: topicData.subject_id,
      expectedSubject: subjectId
    });
    throw new Error(`Topic ${topicId} does not belong to subject ${subjectId}`);
  }

  const { data: questions, error } = await supabase
    .from("questions")
    .select(`
      id,
      topic_id,
      test_type_id,
      topics!inner (
        id,
        subject_id,
        name,
        subject:subjects (
          id,
          name
        )
      )
    `)
    .eq("test_type_id", testTypeId)
    .eq("topic_id", topicId);

  if (error) {
    console.error("Error fetching questions:", error);
    throw new Error(`Failed to fetch questions for topic ${topicId}`);
  }

  // Verify each question's topic belongs to the correct subject
  const filteredQuestions = questions?.filter(q => 
    q.topics?.subject_id === subjectId
  ) || [];

  if (filteredQuestions.length === 0) {
    console.warn(`No questions found for topic ${topicId} in subject ${subjectId}`);
  } else {
    console.log(`Found ${filteredQuestions.length} valid questions for topic ${topicId} in subject ${subjectId}`);
  }

  return filteredQuestions;
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
  // First get the module's subject
  const { data: moduleData, error: moduleError } = await supabase
    .from("test_modules")
    .select("subject_id")
    .eq("id", moduleId)
    .single();

  if (moduleError || !moduleData) {
    throw new Error("Failed to get module subject");
  }

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
          subject_id,
          name,
          subject:subjects!inner (
            id,
            name
          )
        )
      )
    `)
    .eq("module_id", moduleId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to load module questions");
  }

  // Filter out questions that don't match the module's subject
  const validQuestions = moduleQuestions
    ?.filter(mq => mq.question.topics.subject_id === moduleData.subject_id)
    ?.map(mq => mq.question) || [];

  console.log(`Retrieved ${validQuestions.length} valid questions for module ${moduleId} (subject: ${moduleData.subject_id})`);
  return validQuestions;
}
