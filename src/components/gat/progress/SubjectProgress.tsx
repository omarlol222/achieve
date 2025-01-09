import { TopicProgress } from "../TopicProgress";

type SubjectProgressProps = {
  subject: {
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
  };
  calculateTopicProgress: (topicId: string) => {
    percentage: number;
    questionsCorrect: number;
    questionsAttempted: number;
    points: number;
  };
};

export const SubjectProgress = ({ subject, calculateTopicProgress }: SubjectProgressProps) => (
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
            questionsCorrect={progress.questionsCorrect}
            questionsAttempted={progress.questionsAttempted}
          />
        );
      })}
    </div>
  </div>
);