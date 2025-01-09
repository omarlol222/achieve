import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Eye } from "lucide-react";

type ModuleOverviewProps = {
  moduleName: string;
  questions: any[];
  currentIndex: number;
  answers: Record<string, number>;
  flagged: Record<string, boolean>;
  onQuestionSelect: (index: number) => void;
};

export function ModuleOverview({
  moduleName,
  questions,
  currentIndex,
  answers,
  flagged,
  onQuestionSelect,
}: ModuleOverviewProps) {
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
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{answeredCount}</div>
              <div className="text-sm text-gray-600">Answered</div>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{unansweredCount}</div>
              <div className="text-sm text-gray-600">Unanswered</div>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{flaggedCount}</div>
              <div className="text-sm text-gray-600">Flagged</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Questions</h3>
            <div className="grid grid-cols-6 gap-2">
              {questions.map((_, index) => {
                const questionId = questions[index].id;
                const isAnswered = answers[questionId] !== undefined;
                const isFlagged = flagged[questionId];
                const isCurrent = index === currentIndex;

                return (
                  <Button
                    key={index}
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    className={`relative h-10 w-10 p-0 font-medium 
                      ${isAnswered ? "bg-green-100" : ""} 
                      ${isCurrent ? "ring-2 ring-primary" : ""}
                      ${isFlagged ? "border-2 border-yellow-500" : ""}
                    `}
                    onClick={() => onQuestionSelect(index)}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}