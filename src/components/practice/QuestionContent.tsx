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
      {question.question_type === "passage" && (
        <PassageQuestion passageText={question.passage_text} />
      )}

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

        {question.image_url && (
          <div className="my-4">
            <OptimizedImage
              src={question.image_url}
              alt="Question"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        )}

        <QuestionChoices
          choices={choices}
          selectedAnswer={selectedAnswer}
          correctAnswer={showFeedback ? question.correct_answer : undefined}
          showFeedback={showFeedback}
          onAnswerSelect={onAnswerSelect}
        />

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
    </div>
  );
}