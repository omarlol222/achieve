import { SubjectProgress } from "./SubjectProgress";

type ProgressGridProps = {
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

export const ProgressGrid = ({ subjects, calculateTopicProgress }: ProgressGridProps) => (
  <div className="grid md:grid-cols-2 gap-8">
    {subjects && subjects.length > 0 ? (
      subjects.map((subject) => (
        <SubjectProgress
          key={subject.id}
          subject={subject}
          calculateTopicProgress={calculateTopicProgress}
        />
      ))
    ) : (
      <p className="text-muted-foreground">No subjects available.</p>
    )}
  </div>
);