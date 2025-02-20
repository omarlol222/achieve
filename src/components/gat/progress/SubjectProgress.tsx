
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
  };
  calculateTopicProgress: (topicId: string) => {
    percentage: number;
  };
  isExpanded: boolean;
  onToggleExpand: () => void;
};

export const SubjectProgress = memo(({ subject, calculateTopicProgress, isExpanded, onToggleExpand }: SubjectProgressProps) => {
  const topicsList = useMemo(() => 
    subject.topics.map((topic) => {
      const progress = calculateTopicProgress(topic.id);
      
      return (
        <div key={topic.id} className="space-y-4">
          <TopicProgress
            name={topic.name}
            value={progress.percentage}
            isPercentage={true}
          />
          {isExpanded && topic.subtopics && topic.subtopics.length > 0 && (
            <div className="ml-4 space-y-3">
              {topic.subtopics.map((subtopic) => (
                <TopicProgress
                  key={subtopic.id}
                  name={subtopic.name}
                  value={subtopic.progress.points}
                  variant="subtle"
                  isPercentage={false}
                />
              ))}
            </div>
          )}
        </div>
      );
    }),
    [subject.topics, isExpanded, calculateTopicProgress]
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
