import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuestionContentProps = {
  question: {
    id?: string;
    question_text: string;
    choice1: string;
    choice2: string;
    choice3: string;
    choice4: string;
    correct_answer?: number;
    image_url?: string;
    explanation?: string;
    passage_text?: string;
  };
  selectedAnswer: number | null;
  showFeedback?: boolean;
  onAnswerSelect: (answer: number) => void;
};

export function QuestionContent({
  question,
  selectedAnswer,
  showFeedback = false,
  onAnswerSelect,
}: QuestionContentProps) {
  const choices = [
    question.choice1,
    question.choice2,
    question.choice3,
    question.choice4,
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {question.passage_text && (
          <div className="w-1/3 flex-shrink-0">
            <div className="rounded-lg border p-4 bg-muted/20 max-h-[500px] overflow-y-auto">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {question.passage_text}
              </p>
            </div>
          </div>
        )}

        <div className="flex-grow space-y-4">
          <div className="flex gap-6">
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium">{question.question_text}</p>
                {question.id && (
                  <span className="text-xs text-muted-foreground">
                    ID: {question.id}
                  </span>
                )}
              </div>
            </div>
            {question.image_url && (
              <div className="rounded-lg border overflow-hidden w-1/3 flex-shrink-0">
                <img
                  src={question.image_url}
                  alt="Question"
                  className="w-full h-auto object-contain"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            {choices.map((choice, index) => {
              const isCorrect = showFeedback && question.correct_answer === index + 1;
              const isIncorrect =
                showFeedback &&
                selectedAnswer === index + 1 &&
                selectedAnswer !== question.correct_answer;
              const isSelected = selectedAnswer === index + 1;

              return (
                <Button
                  key={index}
                  onClick={() => onAnswerSelect(index + 1)}
                  disabled={showFeedback}
                  className={cn(
                    "w-full justify-start text-left h-auto py-4 px-4",
                    isSelected && !showFeedback && "bg-primary/20",
                    isCorrect && "bg-green-50 border-green-200 hover:bg-green-50",
                    isIncorrect && "bg-red-50 border-red-200 hover:bg-red-50",
                    !isSelected && !showFeedback && "bg-white hover:bg-gray-50"
                  )}
                  variant="outline"
                >
                  {choice}
                </Button>
              );
            })}
          </div>

          {showFeedback && question.explanation && (
            <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">{question.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}