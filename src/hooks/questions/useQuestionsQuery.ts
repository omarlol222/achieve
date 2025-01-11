import { supabase } from "@/integrations/supabase/client";

type QueryParams = {
  search: string;
  subjectFilter: string;
  topicFilter: string;
  difficultyFilter: string;
  typeFilter: string;
  testTypeFilter: string;
  currentPage: number;
  itemsPerPage: number;
  topics: any[];
};

export async function buildQuestionsQuery(params: QueryParams) {
  const {
    search,
    subjectFilter,
    topicFilter,
    difficultyFilter,
    typeFilter,
    testTypeFilter,
    currentPage,
    itemsPerPage,
    topics
  } = params;

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

  // Apply filters
  if (search) {
    query = query.ilike("question_text", `%${search}%`);
  }

  if (subjectFilter && subjectFilter !== "all") {
    const topicsInSubject = topics
      .filter((topic) => topic.subject_id === subjectFilter)
      .map((topic) => topic.id);
    query = query.in("topic_id", topicsInSubject);
  }

  if (topicFilter && topicFilter !== "all") {
    query = query.eq("topic_id", topicFilter);
  }

  if (difficultyFilter && difficultyFilter !== "all") {
    query = query.eq("difficulty", difficultyFilter);
  }

  if (typeFilter && typeFilter !== "all") {
    query = query.eq("question_type", typeFilter);
  }

  if (testTypeFilter && testTypeFilter !== "all") {
    query = query.eq("test_type_id", testTypeFilter);
  }

  // Apply pagination
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  query = query.range(from, to);

  return query;
}