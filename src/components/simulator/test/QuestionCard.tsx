import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionContent } from "@/components/practice/QuestionContent";
import { Flag } from "lucide-react";

type QuestionCardProps = {
  question: any;
  selectedAnswer: number | null;
  isFlagged: boolean;
  onAnswerSelect: (answer: number) => void;
  onToggleFlag: () => void;
};

export function QuestionCard({
  question,
  selectedAnswer,
  isFlagged,
  onAnswerSelect,
  onToggleFlag,
}: QuestionCardProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-end mb-4">
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
        showFeedback={false}
        onAnswerSelect={onAnswerSelect}
      />
    </Card>
  );
}