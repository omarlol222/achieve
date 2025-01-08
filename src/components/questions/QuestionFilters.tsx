import { SearchField } from "./filters/SearchField";
import { FilterSelect } from "./filters/FilterSelect";

type QuestionFiltersProps = {
  search: string;
  setSearch: (value: string) => void;
  subjectFilter: string;
  setSubjectFilter: (value: string) => void;
  topicFilter: string;
  setTopicFilter: (value: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  testTypeFilter: string;
  setTestTypeFilter: (value: string) => void;
  subjects: any[];
  topics: any[];
  testTypes: any[];
};

export function QuestionFilters({
  search,
  setSearch,
  subjectFilter,
  setSubjectFilter,
  topicFilter,
  setTopicFilter,
  difficultyFilter,
  setDifficultyFilter,
  typeFilter,
  setTypeFilter,
  testTypeFilter,
  setTestTypeFilter,
  subjects,
  topics,
  testTypes,
}: QuestionFiltersProps) {
  const filteredTopics = topics?.filter(
    (topic) => !subjectFilter || subjectFilter === "all" || topic.subject_id === subjectFilter
  );

  const questionTypeOptions = [
    { value: "all", label: "All Types" },
    { value: "normal", label: "Normal Questions" },
    { value: "passage", label: "Passage-Based Questions" },
    { value: "analogy", label: "Analogy Questions" },
  ];

  const difficultyOptions = [
    { value: "all", label: "All Levels" },
    ...Array.from({ length: 5 }, (_, i) => ({
      value: String(i + 1),
      label: `Level ${i + 1}`,
    })),
  ];

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-6">
      <SearchField search={search} setSearch={setSearch} />

      <FilterSelect
        value={testTypeFilter}
        onValueChange={setTestTypeFilter}
        placeholder="Filter by test type"
        options={[
          { value: "all", label: "All Test Types" },
          ...(testTypes?.map((type) => ({
            value: type.id,
            label: type.name,
          })) || []),
        ]}
      />

      <FilterSelect
        value={subjectFilter}
        onValueChange={(value) => {
          setSubjectFilter(value);
          setTopicFilter("all");
        }}
        placeholder="Filter by subject"
        options={[
          { value: "all", label: "All Subjects" },
          ...(subjects?.map((subject) => ({
            value: subject.id,
            label: subject.name,
          })) || []),
        ]}
      />

      <FilterSelect
        value={topicFilter}
        onValueChange={setTopicFilter}
        placeholder="Filter by topic"
        options={[
          { value: "all", label: "All Topics" },
          ...(filteredTopics?.map((topic) => ({
            value: topic.id,
            label: topic.name,
          })) || []),
        ]}
      />

      <FilterSelect
        value={typeFilter}
        onValueChange={setTypeFilter}
        placeholder="Filter by type"
        options={questionTypeOptions}
      />

      <FilterSelect
        value={difficultyFilter}
        onValueChange={setDifficultyFilter}
        placeholder="Filter by difficulty"
        options={difficultyOptions}
      />
    </div>
  );
}