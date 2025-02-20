
import { Card } from "@/components/ui/card";
import { SubjectProgress } from "./SubjectProgress";

type ProgressGridProps = {
  subjects: {
    id: string;
    name: string;
    topics: {
      id: string;
      name: string;
      progress: {
        percentage: number;
      };
      subtopics?: {
        id: string;
        name: string;
        progress: {
          points: number;
        };
      }[];
    }[];
  }[];
  calculateTopicProgress: (topicId: string) => {
    percentage: number;
  };
  expandedSubject: string | null;
  onToggleExpand: (subjectId: string) => void;
};

export function ProgressGrid({ 
  subjects, 
  calculateTopicProgress, 
  expandedSubject, 
  onToggleExpand 
}: ProgressGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {subjects.map((subject) => (
        <Card key={subject.id} className="p-6">
          <SubjectProgress
            subject={subject}
            calculateTopicProgress={calculateTopicProgress}
            isExpanded={expandedSubject === subject.id}
            onToggleExpand={() => onToggleExpand(subject.id)}
          />
        </Card>
      ))}
    </div>
  );
}
