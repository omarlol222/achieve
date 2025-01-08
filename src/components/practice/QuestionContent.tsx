import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

type Question = {
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
};

interface QuestionContentProps {
  question: Question;
  selectedAnswer: number | null;
  showFeedback: boolean;
  onAnswerSelect: (answer: number) => void;
}

export const QuestionContent = ({
  question,
  selectedAnswer,
  showFeedback,
  onAnswerSelect,
}: QuestionContentProps) => {
  const renderQuestionText = () => {
    if (question.question_type === "comparison") {
      return (
        <div className="space-y-4">
          <p className="text-lg">{question.question_text}</p>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="border-b p-2 text-center w-1/2 bg-gray-50">A</th>
                  <th className="border-b p-2 text-center w-1/2 bg-gray-50">B</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r p-4 text-center">
                    {question.comparison_value1}
                  </td>
                  <td className="p-4 text-center">{question.comparison_value2}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    return <p className="text-lg">{question.question_text}</p>;
  };

  return (
    <Card className="p-6 space-y-6">
      {renderQuestionText()}

      <div className="space-y-4">
        {[1, 2, 3, 4].map((choice) => (
          <Button
            key={choice}
            variant={selectedAnswer === choice ? "default" : "outline"}
            className={`w-full justify-start h-auto p-4 ${
              showFeedback
                ? choice === question.correct_answer
                  ? "bg-green-100 hover:bg-green-100"
                  : choice === selectedAnswer
                  ? "bg-red-100 hover:bg-red-100"
                  : ""
                : ""
            }`}
            onClick={() => onAnswerSelect(choice)}
          >
            {question[`choice${choice}` as keyof Question]}
            {showFeedback && choice === question.correct_answer && (
              <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
            )}
            {showFeedback &&
              choice === selectedAnswer &&
              choice !== question.correct_answer && (
                <XCircle className="ml-2 h-4 w-4 text-red-500" />
              )}
          </Button>
        ))}
      </div>
    </Card>
  );
};