import { ModuleOverview } from "@/components/simulator/ModuleOverview";

type TestHeaderProps = {
  moduleName: string;
  timeLeft: number;
  questions: any[];
  currentQuestionIndex: number;
  answers: Record<string, number>;
  flagged: Record<string, boolean>;
  onQuestionSelect: (index: number) => void;
};

export function TestHeader({
  moduleName,
  timeLeft,
  questions,
  currentQuestionIndex,
  answers,
  flagged,
  onQuestionSelect,
}: TestHeaderProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">
        {moduleName} Module
      </h1>
      <div className="flex items-center gap-4">
        <div className="text-lg font-medium">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
        <ModuleOverview
          moduleName={moduleName}
          totalQuestions={questions.length}
          currentQuestion={currentQuestionIndex + 1}
          answeredCount={Object.keys(answers).length}
          unansweredCount={questions.length - Object.keys(answers).length}
          flaggedCount={Object.values(flagged).filter(Boolean).length}
          questions={questions}
          currentIndex={currentQuestionIndex}
          answers={answers}
          flagged={flagged}
          onQuestionSelect={onQuestionSelect}
        />
      </div>
    </div>
  );
}