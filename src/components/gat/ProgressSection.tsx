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
  onPracticeClick: () => void;
};

export const ProgressSection = ({ subjects, calculateTopicProgress, onPracticeClick }: ProgressSectionProps) => (
  <section className="space-y-6">
    <h2 className="text-2xl font-bold text-[#1B2B2B] flex justify-between items-center">
      Progress
      <button
        onClick={onPracticeClick}
        className="bg-[#1A2B2B] text-white px-8 py-3 rounded-lg hover:bg-[#1A2B2B]/90 transition-colors"
      >
        Practice
      </button>
    </h2>
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