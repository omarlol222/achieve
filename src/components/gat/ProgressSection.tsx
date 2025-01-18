import { memo, useState } from "react";
import { ProgressHeader } from "./progress/ProgressHeader";
import { ProgressGrid } from "./progress/ProgressGrid";

export type ProgressSectionProps = {
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
};

export const ProgressSection = memo(({ subjects, calculateTopicProgress }: ProgressSectionProps) => {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  return (
    <section className="space-y-6">
      <ProgressHeader />
      <ProgressGrid 
        subjects={subjects}
        calculateTopicProgress={calculateTopicProgress}
        expandedSubject={expandedSubject}
        onToggleExpand={setExpandedSubject}
      />
    </section>
  );
});

ProgressSection.displayName = "ProgressSection";