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
  topicFilter: string;
  setTopicFilter: (value: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (value: string) => void;
  topics: any[];
};

export function QuestionFilters({
  search,
  setSearch,
  topicFilter,
  setTopicFilter,
  difficultyFilter,
  setDifficultyFilter,
  topics,
}: QuestionFiltersProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>

      <Select value={topicFilter} onValueChange={setTopicFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by topic" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Topics</SelectItem>
          {topics?.map((topic) => (
            <SelectItem key={topic.id} value={topic.id}>
              {topic.name}
            </SelectItem>
          ))}
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