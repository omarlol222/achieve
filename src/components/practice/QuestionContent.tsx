import { TeXComponent } from "./TeXComponent";
import { PassageQuestion } from "./question-types/PassageQuestion";
import { ComparisonQuestion } from "./question-types/ComparisonQuestion";
import { QuestionChoices } from "./question-types/QuestionChoices";
import { OptimizedImage } from "@/components/ui/optimized-image/OptimizedImage";

type QuestionContentProps = {
  question: any;
  selectedAnswer: number | null;
  showFeedback: boolean;
  onAnswerSelect: (answer: number) => void;
};

export function QuestionContent({
  question,
  selectedAnswer,
  showFeedback,
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {question.question_type === "passage" && (
          <div className="lg:col-span-4">
            <PassageQuestion passageText={question.passage_text} />
          </div>
        )}

        <div className={`lg:col-span-${question.image_url ? "6" : (question.question_type === "passage" ? "8" : "12")}`}>
          {question.question_type === "comparison" && (
            <ComparisonQuestion
              value1={question.comparison_value1}
              value2={question.comparison_value2}
            />
          )}

          <div className="space-y-4">
            <div className="text-lg font-medium">
              <TeXComponent>{question.question_text}</TeXComponent>
            </div>

            <QuestionChoices
              choices={choices}
              selectedAnswer={selectedAnswer}
              correctAnswer={showFeedback ? question.correct_answer : undefined}
              showFeedback={showFeedback}
              onAnswerSelect={onAnswerSelect}
            />
          </div>
        </div>

        {question.image_url && (
          <div className="lg:col-span-6 lg:col-start-7">
            <OptimizedImage
              src={question.image_url}
              alt="Question"
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}
      </div>

      {showFeedback && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          {question.explanation && (
            <>
              <p className="font-medium mb-2">Explanation:</p>
              <TeXComponent>{question.explanation}</TeXComponent>
            </>
          )}
          {question.explanation_image_url && (
            <div className="mt-4">
              <OptimizedImage
                src={question.explanation_image_url}
                alt="Explanation"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}