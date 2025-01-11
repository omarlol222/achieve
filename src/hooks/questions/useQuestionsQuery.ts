import { supabase } from "@/integrations/supabase/client";

type Difficulty = "Easy" | "Moderate" | "Hard";
type QuestionType = "normal" | "passage" | "analogy" | "comparison";

const isValidDifficulty = (value: string): value is Difficulty => {
  return ["Easy", "Moderate", "Hard"].includes(value);
};

const isValidQuestionType = (value: string): value is QuestionType => {
  return ["normal", "passage", "analogy", "comparison"].includes(value);
};

export function buildQuestionsQuery(
  search: string,
  subjectFilter: string,
  topicFilter: string,
  difficultyFilter: string,
  typeFilter: string,
  page: number = 1,
  pageSize: number = 10
) {
  let query = supabase
    .from("questions")
    .select(
      `
      *,
      topic:topics (
        id,
        name,
        subject:subjects (
          id,
          name
        )
      )
    `,
      { count: "exact" }
    );

  // Apply search filter
  if (search) {
    query = query.ilike("question_text", `%${search}%`);
  }

  // Apply subject filter
  if (subjectFilter && subjectFilter !== "all") {
    query = query.eq("topic.subject.id", subjectFilter);
  }

  // Apply topic filter
  if (topicFilter && topicFilter !== "all") {
    query = query.eq("topic_id", topicFilter);
  }

  // Apply difficulty filter
  if (difficultyFilter && difficultyFilter !== "all") {
    if (isValidDifficulty(difficultyFilter)) {
      query = query.eq("difficulty", difficultyFilter);
    }
  }

  // Apply question type filter
  if (typeFilter && typeFilter !== "all") {
    if (isValidQuestionType(typeFilter)) {
      query = query.eq("question_type", typeFilter);
    }
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to).order("created_at", { ascending: false });

  return query;
}