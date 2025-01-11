import { cn } from "@/lib/utils";
import { TeXComponent } from "./TeXComponent";
import { ScrollArea } from "@/components/ui/scroll-area";

type QuestionContentProps = {
  question: any;
  selectedAnswer: number | null;
  showFeedback?: boolean;
  onAnswerSelect?: (answer: number) => void;
};

export function QuestionContent({
  question,
  selectedAnswer,
  showFeedback = false,
  onAnswerSelect,
}: QuestionContentProps) {
  const isCorrect = showFeedback && selectedAnswer === question.correct_answer;
  const isIncorrect = showFeedback && selectedAnswer !== question.correct_answer;

  const renderComparisonTable = () => (
    <div className="space-y-4 mb-6">
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="border-b p-2 text-center w-1/2">A</th>
              <th className="border-b p-2 text-center w-1/2">B</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-r p-4">
                <div className="text-center">
                  {question.comparison_value1}
                </div>
              </td>
              <td className="p-4">
                <div className="text-center">
                  {question.comparison_value2}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {question.question_type === "passage" && (
        <ScrollArea className="h-[200px] rounded-lg">
          <div className="bg-gray-50 p-4">
            <p className="whitespace-pre-wrap">{question.passage_text}</p>
          </div>
        </ScrollArea>
      )}

      {question.question_type === "comparison" && renderComparisonTable()}

      <div className="space-y-4">
        <div className="font-medium">
          <TeXComponent>{question.question_text}</TeXComponent>
        </div>

        {question.image_url && (
          <div className="flex justify-center">
            <img
              src={question.image_url}
              alt="Question"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        )}

        <div className="space-y-3">
          {[1, 2, 3, 4].map((choice) => {
            const isSelected = selectedAnswer === choice;
            const choiceText = question[`choice${choice}`];

            return (
              <button
                key={choice}
                onClick={() => onAnswerSelect?.(choice)}
                disabled={showFeedback}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border transition-colors",
                  isSelected && !showFeedback && "border-primary bg-primary/5",
                  !isSelected && !showFeedback && "hover:border-primary/50",
                  showFeedback && choice === question.correct_answer && "border-green-500 bg-green-50",
                  showFeedback && isSelected && choice !== question.correct_answer && "border-red-500 bg-red-50"
                )}
              >
                <TeXComponent>{choiceText}</TeXComponent>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className={cn(
            "mt-4 p-4 rounded-lg",
            isCorrect ? "bg-green-50" : "bg-red-50"
          )}>
            <p className="font-medium mb-2">
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
            {question.explanation && (
              <p className="text-sm">
                <TeXComponent>{question.explanation}</TeXComponent>
              </p>
            )}
            {question.explanation_image_url && (
              <div className="mt-4 flex justify-center">
                <img
                  src={question.explanation_image_url}
                  alt="Explanation"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}