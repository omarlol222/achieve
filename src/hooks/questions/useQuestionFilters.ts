import { useState } from "react";

export function useQuestionFilters() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [testTypeFilter, setTestTypeFilter] = useState<string>("all");

  const resetFilters = () => {
    setSearch("");
    setSubjectFilter("all");
    setTopicFilter("all");
    setDifficultyFilter("all");
    setTypeFilter("all");
    setTestTypeFilter("all");
    setCurrentPage(1);
  };

  return {
    filters: {
      search,
      subjectFilter,
      topicFilter,
      difficultyFilter,
      typeFilter,
      testTypeFilter,
      currentPage,
    },
    setters: {
      setSearch,
      setSubjectFilter,
      setTopicFilter,
      setDifficultyFilter,
      setTypeFilter,
      setTestTypeFilter,
      setCurrentPage,
    },
    resetFilters,
  };
}