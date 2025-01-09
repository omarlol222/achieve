import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AnswerCardProps = {
  question: {
    id: string;
    question_text: string;
    choice1: string;
    choice2: string;
    choice3: string;
    choice4: string;
    correct_answer: number;
    explanation?: string;
    topic?: {
      id: string;
      name: string;
    };
  };
  selectedAnswer?: number | null;
};

export const AnswerCard = ({ question, selectedAnswer }: AnswerCardProps) => {
  const choices = [
    question.choice1,
    question.choice2,
    question.choice3,
    question.choice4,
  ];

  const getAnswerStyle = (index: number) => {
    if (selectedAnswer === null || selectedAnswer === undefined) return "";
    
    if (index + 1 === question.correct_answer) {
      return "bg-green-100 border-green-500";
    }
    
    if (index + 1 === selectedAnswer && selectedAnswer !== question.correct_answer) {
      return "bg-red-100 border-red-500";
    }
    
    return "";
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Topic: {question.topic?.name || "Unknown"}
            </p>
            <p className="font-medium">{question.question_text}</p>
          </div>
        </div>

        <div className="space-y-3">
          {choices.map((choice, index) => (
            <div
              key={index}
              className={cn(
                "p-4 border rounded-lg",
                getAnswerStyle(index)
              )}
            >
              {choice}
            </div>
          ))}
        </div>

        {question.explanation && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">Explanation:</p>
            <p className="mt-1">{question.explanation}</p>
          </div>
        )}
      </div>
    </Card>
  );
};