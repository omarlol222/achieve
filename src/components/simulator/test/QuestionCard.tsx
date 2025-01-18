import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import { ContentProtection } from "@/components/security/ContentProtection";
import { QuestionChoices } from "@/components/practice/question-types/QuestionChoices";
import { PassageQuestion } from "@/components/practice/question-types/PassageQuestion";
import { ComparisonQuestion } from "@/components/practice/question-types/ComparisonQuestion";
import { TeXComponent } from "@/components/practice/TeXComponent";

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
}: QuestionCardProps) => {
  if (!question) {
    console.error("Question is undefined");
    return null;
  }

  const choices = [
    question.choice1,
    question.choice2,
    question.choice3,
    question.choice4,
  ];

  return (
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

        <div className="space-y-6">
          {question.question_type === "passage" && question.passage_text && (
            <PassageQuestion passageText={question.passage_text} />
          )}

          {question.question_type === "comparison" && (
            <ComparisonQuestion
              value1={question.comparison_value1 || ""}
              value2={question.comparison_value2 || ""}
            />
          )}

          <div className="space-y-4">
            <div className="text-lg font-medium">
              <TeXComponent>{question.question_text}</TeXComponent>
            </div>

            <QuestionChoices
              choices={choices}
              selectedAnswer={selectedAnswer}
              showFeedback={false}
              onAnswerSelect={onAnswerSelect}
            />
          </div>
        </div>
      </Card>
    </ContentProtection>
  );
});

QuestionCard.displayName = "QuestionCard";