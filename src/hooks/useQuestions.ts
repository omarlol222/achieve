import { useQuery } from "@tanstack/react-query";
import { buildQuestionsQuery } from "./questions/useQuestionsQuery";
import { useQuestionData } from "./questions/useQuestionData";

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
  const { subjects, topics, testTypes } = useQuestionData();

  const { data: questionsData, isLoading } = useQuery({
    queryKey: [
      "questions", 
      search, 
      subjectFilter, 
      topicFilter, 
      difficultyFilter, 
      typeFilter, 
      testTypeFilter, 
      currentPage
    ],
    queryFn: async () => {
      const queryParams = {
        search,
        subjectFilter,
        topicFilter,
        difficultyFilter,
        typeFilter,
        testTypeFilter,
        currentPage,
        itemsPerPage,
        topics: topics || []
      };

      const { data, error, count } = await buildQuestionsQuery(queryParams);

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