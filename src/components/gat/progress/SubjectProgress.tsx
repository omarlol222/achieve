import { memo, useMemo } from "react";
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

export const SubjectProgress = memo(({ subject, calculateTopicProgress }: SubjectProgressProps) => {
  // Memoize the topics list to prevent unnecessary re-renders
  const topicsList = useMemo(() => 
    subject.topics.map((topic) => {
      const progress = calculateTopicProgress(topic.id);
      return (
        <TopicProgress
          key={topic.id}
          name={topic.name}
          value={progress.points}
        />
      );
    }),
    [subject.topics, calculateTopicProgress]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{subject.name}</h3>
      <div className="space-y-3">
        {topicsList}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Deep comparison for subject and calculateTopicProgress
  return (
    prevProps.subject.id === nextProps.subject.id &&
    prevProps.subject.name === nextProps.subject.name &&
    prevProps.subject.topics === nextProps.subject.topics &&
    prevProps.calculateTopicProgress === nextProps.calculateTopicProgress
  );
});

SubjectProgress.displayName = "SubjectProgress";