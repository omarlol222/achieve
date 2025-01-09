import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type QuestionContentProps = {
  question: {
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
      {question.passage_text && (
        <div className="rounded-lg border p-4 bg-muted/20">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {question.passage_text}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-6">
          {question.image_url && (
            <div className="rounded-lg border overflow-hidden w-1/3 flex-shrink-0">
              <img
                src={question.image_url}
                alt="Question"
                className="w-full h-auto object-contain"
              />
            </div>
          )}
          <div className="flex-grow">
            <p className="text-lg font-medium">{question.question_text}</p>
          </div>
        </div>

        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(value) => onAnswerSelect(parseInt(value))}
          className="space-y-2"
        >
          {choices.map((choice, index) => {
            const isCorrect = showFeedback && question.correct_answer === index + 1;
            const isIncorrect =
              showFeedback &&
              selectedAnswer === index + 1 &&
              selectedAnswer !== question.correct_answer;

            return (
              <div
                key={index}
                className={cn(
                  "flex items-center space-x-2 rounded-lg border p-4 transition-colors",
                  isCorrect && "bg-green-50 border-green-200",
                  isIncorrect && "bg-red-50 border-red-200"
                )}
              >
                <RadioGroupItem value={(index + 1).toString()} id={`choice-${index + 1}`} />
                <Label
                  htmlFor={`choice-${index + 1}`}
                  className="flex-grow cursor-pointer"
                >
                  {choice}
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {showFeedback && question.explanation && (
          <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}