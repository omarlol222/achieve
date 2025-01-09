import { Card } from "@/components/ui/card";

type TopicStats = {
  name: string;
  correct: number;
  total: number;
};

type TopicPerformanceProps = {
  topics: TopicStats[];
};

export function TopicPerformance({ topics }: TopicPerformanceProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Topic Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic) => (
          <Card key={topic.name} className="p-4">
            <h3 className="font-semibold mb-2">{topic.name}</h3>
            <p>
              Correct: {topic.correct} / {topic.total}
              <span className="text-gray-500 ml-2">
                ({Math.round((topic.correct / topic.total) * 100)}%)
              </span>
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}