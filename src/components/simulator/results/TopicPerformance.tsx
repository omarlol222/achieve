import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <div className="space-y-8">
        {Object.entries(topicsBySubject).map(([subjectId, subject]) => (
          <div key={subjectId}>
            <h3 className="text-xl font-semibold mb-3">{subject.name}</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead className="text-right">Correct</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subject.topics.map((topic) => (
                    <TableRow key={topic.name}>
                      <TableCell className="font-medium">{topic.name}</TableCell>
                      <TableCell className="text-right">{topic.correct}</TableCell>
                      <TableCell className="text-right">{topic.total}</TableCell>
                      <TableCell className="text-right">
                        {Math.round((topic.correct / topic.total) * 100)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}