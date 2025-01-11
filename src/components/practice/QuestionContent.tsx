import { TeXComponent } from "./TeXComponent";
import { PassageQuestion } from "./question-types/PassageQuestion";
import { ComparisonQuestion } from "./question-types/ComparisonQuestion";
import { QuestionChoices } from "./question-types/QuestionChoices";

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

        <QuestionChoices
          choices={choices}
          selectedAnswer={selectedAnswer}
          correctAnswer={showFeedback ? question.correct_answer : undefined}
          showFeedback={showFeedback}
          onAnswerSelect={onAnswerSelect}
        />

        {showFeedback && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="font-medium mb-2">Explanation:</p>
            <TeXComponent>{question.explanation}</TeXComponent>
          </div>
        )}
      </div>
    </div>
  );
}