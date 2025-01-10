import { Card } from "@/components/ui/card";

type TopicStats = {
  name: string;
  correct: number;
  total: number;
  subjectId: string;
  subjectName: string;
};

type TopicPerformanceProps = {
  topics: TopicStats[];
};

export function TopicPerformance({ topics }: TopicPerformanceProps) {
  // Group topics by subject
  const topicsBySubject = topics.reduce((acc, topic) => {
    const subjectId = topic.subjectId;
    if (!acc[subjectId]) {
      acc[subjectId] = {
        name: topic.subjectName,
        topics: []
      };
    }
    acc[subjectId].topics.push(topic);
    return acc;
  }, {} as { [key: string]: { name: string; topics: TopicStats[] } });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Topic Performance</h2>
      <div className="space-y-6">
        {Object.entries(topicsBySubject).map(([subjectId, subject]) => (
          <div key={subjectId}>
            <h3 className="text-xl font-semibold mb-3">{subject.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subject.topics.map((topic) => (
                <Card key={topic.name} className="p-4">
                  <h4 className="font-semibold mb-2">{topic.name}</h4>
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
        ))}
      </div>
    </div>
  );
}