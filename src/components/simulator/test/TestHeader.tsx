import { Timer } from "lucide-react";

type TestHeaderProps = {
  moduleName: string;
  timeLeft: number;
  currentIndex: number;
  totalQuestions: number;
};

export function TestHeader({
  moduleName,
  timeLeft,
  currentIndex,
  totalQuestions,
}: TestHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">{moduleName}</h2>
        <div className="flex items-center gap-2 text-gray-600">
          <Timer className="h-4 w-4" />
          <span>
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        Question {currentIndex + 1} of {totalQuestions}
      </div>
    </div>
  );
}