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
    }[];
  }[];
  calculateTopicProgress: (topicId: string) => {
    percentage: number;
    points: number;
  };
};

export const ProgressGrid = memo(({ subjects, calculateTopicProgress }: ProgressGridProps) => {
  // Memoize the empty state check
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
        />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Deep comparison for subjects array
  return (
    prevProps.subjects === nextProps.subjects &&
    prevProps.calculateTopicProgress === nextProps.calculateTopicProgress
  );
});

ProgressGrid.displayName = "ProgressGrid";