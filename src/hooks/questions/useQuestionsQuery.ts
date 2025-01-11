import { supabase } from "@/integrations/supabase/client";

export function buildQuestionsQuery(
  search: string,
  subjectFilter: string,
  topicFilter: string,
  difficultyFilter: string,
  typeFilter: string,
  testTypeFilter: string,
  currentPage: number,
  itemsPerPage: number,
  topics: any[]
) {
  let query = supabase
    .from("questions")
    .select(
      `
      *,
      topic:topics(
        name,
        subject:subjects(
          name
        )
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("question_text", `%${search}%`);
  }

  if (topicFilter && topicFilter !== "all") {
    query = query.eq("topic_id", topicFilter);
  } else if (subjectFilter && subjectFilter !== "all") {
    const filteredTopicIds = topics
      ?.filter((topic) => topic.subject_id === subjectFilter)
      .map((topic) => topic.id);
    query = query.in("topic_id", filteredTopicIds);
  }

  if (difficultyFilter && difficultyFilter !== "all") {
    const validDifficulty = ["Easy", "Moderate", "Hard"].includes(difficultyFilter) 
      ? difficultyFilter 
      : "Easy";
    query = query.eq("difficulty", validDifficulty);
  }

  if (typeFilter && typeFilter !== "all") {
    query = query.eq("question_type", typeFilter);
  }

  if (testTypeFilter && testTypeFilter !== "all") {
    query = query.eq("test_type_id", testTypeFilter);
  }

  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  return query.range(from, to);
}