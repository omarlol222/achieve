import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useQuestions(
  search: string,
  subjectFilter: string,
  topicFilter: string,
  difficultyFilter: string,
  typeFilter: string,
  testTypeFilter: string,
  currentPage: number,
  itemsPerPage: number
) {
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: topics } = useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*, subject:subjects(name)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: testTypes } = useQuery({
    queryKey: ["testTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ["questions", search, subjectFilter, topicFilter, difficultyFilter, typeFilter, testTypeFilter, currentPage],
    queryFn: async () => {
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
        query = query.eq("difficulty", parseInt(difficultyFilter));
      }

      if (typeFilter && typeFilter !== "all") {
        query = query.eq("question_type", typeFilter);
      }

      if (testTypeFilter && testTypeFilter !== "all") {
        query = query.eq("test_type_id", testTypeFilter);
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      return {
        questions: data,
        total: count || 0,
      };
    },
  });

  return {
    subjects,
    topics,
    testTypes,
    questionsData,
    isLoading,
  };
}