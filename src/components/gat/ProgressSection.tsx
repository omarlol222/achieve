import { memo } from "react";
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
    }[];
  }[];
  calculateTopicProgress: (topicId: string) => {
    percentage: number;
    points: number;
  };
};

export const ProgressSection = memo(({ subjects, calculateTopicProgress }: ProgressSectionProps) => (
  <section className="space-y-6">
    <ProgressHeader />
    <ProgressGrid 
      subjects={subjects}
      calculateTopicProgress={calculateTopicProgress}
    />
  </section>
));

ProgressSection.displayName = "ProgressSection";