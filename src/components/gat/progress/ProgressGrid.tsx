import { memo, useMemo } from "react";
import { SubjectProgress } from "./SubjectProgress";

type ProgressGridProps = {
  subjects: {
    id: string;
    name: string;
    topics: {
      id: string;
      name: string;
      progress: {
        points: number;
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
    points: number;
  };
  expandedSubject: string | null;
  onToggleExpand: (subjectId: string | null) => void;
};

export const ProgressGrid = memo(({ subjects, calculateTopicProgress, expandedSubject, onToggleExpand }: ProgressGridProps) => {
  const isEmpty = useMemo(() => !subjects || subjects.length === 0, [subjects]);

  if (isEmpty) {
    return <p className="text-muted-foreground">No subjects available.</p>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {subjects.map((subject) => (
        <SubjectProgress
          key={subject.id}
          subject={subject}
          calculateTopicProgress={calculateTopicProgress}
          isExpanded={expandedSubject === subject.id}
          onToggleExpand={() => onToggleExpand(expandedSubject === subject.id ? null : subject.id)}
        />
      ))}
    </div>
  );
});

ProgressGrid.displayName = "ProgressGrid";