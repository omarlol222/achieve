import { memo } from "react";
import { Button } from "@/components/ui/button";
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
  questions: any[];
  currentIndex: number;
  answers: Record<string, number>;
  flagged: Record<string, boolean>;
  onQuestionSelect: (index: number) => void;
  onSubmit: () => void;
};

export const ModuleOverview = memo(({
  moduleName,
  questions,
  currentIndex,
  answers,
  flagged,
  onQuestionSelect,
  onSubmit,
}: ModuleOverviewProps) => {
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Module Overview
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{moduleName}</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
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
          <Button 
            onClick={onSubmit}
            className="w-full"
            disabled={unansweredCount > 0}
          >
            Submit Module
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
});

ModuleOverview.displayName = "ModuleOverview";