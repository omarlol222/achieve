import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Eye } from "lucide-react";
import { ModuleStats } from "./stats/ModuleStats";
import { QuestionGrid } from "./stats/QuestionGrid";

type ModuleOverviewProps = {
  moduleName: string;
  totalQuestions: number;
  currentQuestion: number;
  answeredCount: number;
  unansweredCount: number;
  flaggedCount: number;
  questions: any[];
  currentIndex: number;
  answers: Record<string, number>;
  flagged: Record<string, boolean>;
  onQuestionSelect: (index: number) => void;
};

export function ModuleOverview({
  moduleName,
  totalQuestions,
  currentQuestion,
  answeredCount,
  unansweredCount,
  flaggedCount,
  questions,
  currentIndex,
  answers,
  flagged,
  onQuestionSelect,
}: ModuleOverviewProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 text-sm text-gray-600">
          <Eye className="h-4 w-4" />
          Overview
        </button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {moduleName} Module - Question {currentQuestion} of {totalQuestions}
          </SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <ModuleStats
            answeredCount={answeredCount}
            unansweredCount={unansweredCount}
            flaggedCount={flaggedCount}
          />

          <QuestionGrid
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            flagged={flagged}
            onQuestionSelect={onQuestionSelect}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}