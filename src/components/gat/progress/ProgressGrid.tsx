import { memo } from "react";
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

export const ProgressGrid = memo(({ subjects, calculateTopicProgress }: ProgressGridProps) => (
  <div className="grid md:grid-cols-2 gap-8">
    {subjects && subjects.length > 0 ? (
      subjects.map((subject) => (
        <SubjectProgress
          key={subject.id}
          subject={subject}
          calculateTopicProgress={calculateTopicProgress}
        />
      ))
    ) : (
      <p className="text-muted-foreground">No subjects available.</p>
    )}
  </div>
));

ProgressGrid.displayName = "ProgressGrid";