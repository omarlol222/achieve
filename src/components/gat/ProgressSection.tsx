import { Card } from "@/components/ui/card";
import { TopicProgress } from "./TopicProgress";

type Subject = {
  id: string;
  name: string;
  topics: Array<{
    id: string;
    name: string;
  }>;
};

type ProgressSectionProps = {
  subjects: Subject[];
  calculateTopicProgress: (topicId: string) => {
    percentage: number;
    questionsCorrect: number;
  };
  onPracticeClick: () => void;
};

export const ProgressSection = ({ subjects, calculateTopicProgress, onPracticeClick }: ProgressSectionProps) => (
  <section className="space-y-6">
    <h2 className="text-2xl font-bold text-[#1B2B2B] flex justify-between items-center">
      Progress
      <button
        onClick={onPracticeClick}
        className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
      >
        Practice
      </button>
    </h2>
    <div className="grid md:grid-cols-2 gap-8">
      {subjects && subjects.length > 0 ? (
        subjects.map((subject) => (
          <Card key={subject.id} className="p-6 space-y-4">
            <h3 className="text-xl font-semibold text-center">
              {subject.name}
            </h3>
            <div className="space-y-4">
              {subject.topics && subject.topics.length > 0 ? (
                subject.topics.map((topic) => {
                  const progress = calculateTopicProgress(topic.id);
                  return (
                    <TopicProgress
                      key={topic.id}
                      name={topic.name}
                      value={progress.percentage}
                      questionsCorrect={progress.questionsCorrect}
                    />
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground">No topics available for this subject</p>
              )}
            </div>
          </Card>
        ))
      ) : (
        <div className="col-span-2">
          <Card className="p-6">
            <p className="text-center text-muted-foreground">No subjects available</p>
          </Card>
        </div>
      )}
    </div>
  </section>
);