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
        questions_attempted: number;
        questions_correct: number;
        points: number;
      };
    }[];
  }[];
  calculateTopicProgress: (topicId: string) => {
    percentage: number;
    questionsCorrect: number;
    questionsAttempted: number;
    points: number;
  };
};

export const ProgressSection = ({ subjects, calculateTopicProgress }: ProgressSectionProps) => (
  <section className="space-y-6">
    <ProgressHeader />
    <ProgressGrid 
      subjects={subjects}
      calculateTopicProgress={calculateTopicProgress}
    />
  </section>
);