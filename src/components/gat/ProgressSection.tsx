import { TopicProgress } from "./TopicProgress";

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
      };
    }[];
  }[];
  calculateTopicProgress: (topicId: string) => {
    percentage: number;
    questionsCorrect: number;
  };
};

export const ProgressSection = ({ subjects, calculateTopicProgress }: ProgressSectionProps) => (
  <section className="space-y-6">
    <h2 className="text-2xl font-bold text-[#1B2B2B]">Progress</h2>
    <div className="grid md:grid-cols-2 gap-8">
      {subjects && subjects.length > 0 ? (
        subjects.map((subject) => (
          <div key={subject.id} className="space-y-4">
            <h3 className="text-xl font-semibold">{subject.name}</h3>
            <div className="space-y-3">
              {subject.topics.map((topic) => {
                const progress = calculateTopicProgress(topic.id);
                return (
                  <TopicProgress
                    key={topic.id}
                    name={topic.name}
                    value={progress.percentage}
                    questionsCorrect={progress.questionsCorrect}
                  />
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted-foreground">No subjects available.</p>
      )}
    </div>
  </section>
);