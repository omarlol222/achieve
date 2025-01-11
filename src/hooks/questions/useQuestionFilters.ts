import { useState } from "react";

export function useQuestionFilters() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const resetFilters = () => {
    setSearch("");
    setSubjectFilter("all");
    setTopicFilter("all");
    setDifficultyFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
  };

  return {
    filters: {
      search,
      subjectFilter,
      topicFilter,
      difficultyFilter,
      typeFilter,
      currentPage,
    },
    setters: {
      setSearch,
      setSubjectFilter,
      setTopicFilter,
      setDifficultyFilter,
      setTypeFilter,
      setCurrentPage,
    },
    resetFilters,
  };
}