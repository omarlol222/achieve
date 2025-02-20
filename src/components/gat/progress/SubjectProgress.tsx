
import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
      subtopics?: {
        id: string;
        name: string;
        progress: {
          points: number;
        };
      }[];
    }[];
  };
  calculateTopicProgress: (topicId: string) => {
    percentage: number;
    points: number;
  };
  isExpanded: boolean;
  onToggleExpand: () => void;
};

export const SubjectProgress = memo(({ subject, calculateTopicProgress, isExpanded, onToggleExpand }: SubjectProgressProps) => {
  const topicsList = useMemo(() => 
    subject.topics.map((topic) => {
      const subtopicsProgress = topic.subtopics?.map(st => st.progress.points) || [];
      const averagePoints = subtopicsProgress.length > 0
        ? Math.round(subtopicsProgress.reduce((sum, points) => sum + points, 0) / subtopicsProgress.length)
        : 0;

      return (
        <div key={topic.id} className="space-y-4">
          <TopicProgress
            name={topic.name}
            value={averagePoints}
          />
          {isExpanded && topic.subtopics && topic.subtopics.length > 0 && (
            <div className="ml-4 space-y-3">
              {topic.subtopics.map((subtopic) => (
                <TopicProgress
                  key={subtopic.id}
                  name={subtopic.name}
                  value={subtopic.progress.points}
                  variant="subtle"
                />
              ))}
            </div>
          )}
        </div>
      );
    }),
    [subject.topics, isExpanded]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{subject.name}</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onToggleExpand}
        >
          {isExpanded ? "Hide details" : "View details"}
        </Button>
      </div>
      <div className="space-y-3">
        {topicsList}
      </div>
    </div>
  );
});

SubjectProgress.displayName = "SubjectProgress";
