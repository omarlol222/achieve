import { memo } from "react";
import { TopicProgress } from "../TopicProgress";

type SubjectProgressProps = {
  subject: {
    id: string;
    name: string;
    topics: {
      id: string;
      name: string;
      progress: {
        points: number;
      };
    }[];
  };
  calculateTopicProgress: (topicId: string) => {
    percentage: number;
    points: number;
  };
};

export const SubjectProgress = memo(({ subject, calculateTopicProgress }: SubjectProgressProps) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold">{subject.name}</h3>
    <div className="space-y-3">
      {subject.topics.map((topic) => {
        const progress = calculateTopicProgress(topic.id);
        return (
          <TopicProgress
            key={topic.id}
            name={topic.name}
            value={progress.points}
          />
        );
      })}
    </div>
  </div>
));

SubjectProgress.displayName = "SubjectProgress";