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
  questionNumber?: number;
  totalQuestions?: number;
};

export function QuestionContent({
  question,
  selectedAnswer,
  showFeedback,
  onAnswerSelect,
  questionNumber = 1,
  totalQuestions = 1,
}: QuestionContentProps) {
  if (!question) {
    console.error("No question provided to QuestionContent");
    return null;
  }

  const choices = [
    question.choice1,
    question.choice2,
    question.choice3,
    question.choice4,
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          QUESTION {questionNumber}
        </h2>
        {question.id && (
          <span className="text-gray-500">QUESTION ID #{question.id}</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`lg:col-span-${question.image_url ? "6" : "12"}`}>
          {question.question_type === "passage" && (
            <div className="mb-6">
              <PassageQuestion passageText={question.passage_text} />
            </div>
          )}

          {question.question_type === "comparison" && (
            <div className="mb-6">
              <ComparisonQuestion
                value1={question.comparison_value1}
                value2={question.comparison_value2}
              />
            </div>
          )}

          <div className="space-y-6">
            <div className="text-lg text-gray-800 leading-relaxed">
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
          <div className="lg:col-span-6">
            <div className="bg-black rounded-lg overflow-hidden">
              <OptimizedImage
                src={question.image_url}
                alt="Question"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {showFeedback && (
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          {question.explanation && (
            <>
              <p className="font-medium mb-3">Explanation:</p>
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