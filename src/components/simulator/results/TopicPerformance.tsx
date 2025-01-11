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
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Topic Performance</h2>
      {Object.entries(topicsBySubject).map(([subjectId, subject]) => (
        <div key={subjectId} className="space-y-3">
          <h3 className="text-xl font-semibold">{subject.name}</h3>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50%]">Topic</TableHead>
                  <TableHead className="text-right">Correct</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subject.topics.map((topic, index) => (
                  <TableRow key={`${topic.name}-${index}`}>
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
  );
}