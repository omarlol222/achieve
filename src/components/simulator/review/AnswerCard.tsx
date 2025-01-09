import { CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

type Answer = {
  id: string;
  selected_answer: number;
  question: {
    id: string;
    question_text: string;
    correct_answer: number;
    choice1: string;
    choice2: string;
    choice3: string;
    choice4: string;
    explanation?: string;
    image_url?: string;
    topic?: {
      id: string;
      name: string;
    };
  };
};

type AnswerCardProps = {
  answer: Answer;
};

export function AnswerCard({ answer }: AnswerCardProps) {
  const isCorrect = answer.selected_answer === answer.question.correct_answer;

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        {isCorrect ? (
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
        ) : (
          <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
        )}
        <div className="space-y-4 flex-1">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <p className="font-medium">{answer.question.question_text}</p>
              <span className="text-xs text-gray-500">ID: {answer.question.id}</span>
            </div>
            {answer.question.image_url && (
              <img 
                src={answer.question.image_url} 
                alt="Question" 
                className="max-w-full h-auto rounded-lg"
              />
            )}
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((choice) => {
              const isSelected = answer.selected_answer === choice;
              const isCorrect = answer.question.correct_answer === choice;
              return (
                <div
                  key={choice}
                  className={`p-3 rounded-lg ${
                    isSelected
                      ? isCorrect
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                      : isCorrect
                      ? "bg-green-50 border border-green-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  {answer.question[`choice${choice}` as keyof typeof answer.question]}
                </div>
              );
            })}
          </div>
          {answer.question.explanation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{answer.question.explanation}</p>
            </div>
          )}
          {answer.question.topic && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">Topic: {answer.question.topic.name}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}