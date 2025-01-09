import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionContent } from "@/components/practice/QuestionContent";
import { Flag } from "lucide-react";
import { ModuleOverview } from "./ModuleOverview";

type QuestionCardProps = {
  question: any;
  selectedAnswer: number | null;
  isFlagged: boolean;
  onAnswerSelect: (answer: number) => void;
  onToggleFlag: () => void;
  showFeedback: boolean;
  moduleName: string;
  questions: any[];
  currentIndex: number;
  answers: Record<string, number>;
  flagged: Record<string, boolean>;
  onQuestionSelect: (index: number) => void;
};

export function QuestionCard({
  question,
  selectedAnswer,
  isFlagged,
  onAnswerSelect,
  onToggleFlag,
  showFeedback,
  moduleName,
  questions,
  currentIndex,
  answers,
  flagged,
  onQuestionSelect,
}: QuestionCardProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between mb-4">
        <ModuleOverview
          moduleName={moduleName}
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          flagged={flagged}
          onQuestionSelect={onQuestionSelect}
        />
        <Button
          variant={isFlagged ? "default" : "outline"}
          size="sm"
          onClick={onToggleFlag}
          className="flex items-center gap-2"
        >
          <Flag className="h-4 w-4" />
          {isFlagged ? "Flagged" : "Flag for review"}
        </Button>
      </div>

      <QuestionContent
        question={question}
        selectedAnswer={selectedAnswer}
        showFeedback={showFeedback}
        onAnswerSelect={onAnswerSelect}
      />
    </Card>
  );
}