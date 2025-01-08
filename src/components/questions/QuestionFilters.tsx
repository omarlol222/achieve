import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-6">
      <div className="md:col-span-2">
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>

      <Select value={testTypeFilter} onValueChange={setTestTypeFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by test type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Test Types</SelectItem>
          {testTypes?.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={subjectFilter} onValueChange={(value) => {
        setSubjectFilter(value);
        setTopicFilter("all");
      }}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Subjects</SelectItem>
          {subjects?.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={topicFilter} onValueChange={setTopicFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by topic" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Topics</SelectItem>
          {filteredTopics?.map((topic) => (
            <SelectItem key={topic.id} value={topic.id}>
              {topic.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="normal">Normal Questions</SelectItem>
          <SelectItem value="passage">Passage-Based Questions</SelectItem>
          <SelectItem value="analogy">Analogy Questions</SelectItem>
        </SelectContent>
      </Select>

      <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          {[1, 2, 3, 4, 5].map((level) => (
            <SelectItem key={level} value={String(level)}>
              Level {level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}