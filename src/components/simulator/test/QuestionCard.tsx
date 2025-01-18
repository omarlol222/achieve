import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionContent } from "@/components/practice/QuestionContent";
import { Flag } from "lucide-react";
import { ContentProtection } from "@/components/security/ContentProtection";

type QuestionCardProps = {
  question: {
    id: string;
    question_text: string;
    choice1: string;
    choice2: string;
    choice3: string;
    choice4: string;
    correct_answer: number;
    question_type: string;
    comparison_value1?: string;
    comparison_value2?: string;
    image_url?: string;
    explanation?: string;
    passage_text?: string;
  };
  selectedAnswer: number | null;
  isFlagged: boolean;
  onAnswerSelect: (answer: number) => void;
  onFlagToggle: () => void;
};

export const QuestionCard = memo(({
  question,
  selectedAnswer,
  isFlagged,
  onAnswerSelect,
  onFlagToggle,
}: QuestionCardProps) => (
  <ContentProtection>
    <Card className="p-6">
      <div className="flex justify-between mb-4">
        <Button
          variant={isFlagged ? "default" : "outline"}
          size="sm"
          onClick={onFlagToggle}
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
  </ContentProtection>
));

QuestionCard.displayName = "QuestionCard";