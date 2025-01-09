import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogClose,
} from "@/components/ui/alert-dialog";

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
  image_url?: string;
  explanation?: string;
  passage_text?: string;
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

  const handleAnswerSelect = (choice: number) => {
    if (!selectedAnswer) {
      onAnswerSelect(choice);
    }
  };

  const renderContent = () => {
    if (question.question_type === "passage") {
      return (
        <div className="flex gap-6">
          <div className="flex-1 bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Passage</h3>
            <div className="prose max-w-none">
              {question.passage_text?.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          <div className="flex-1">
            {renderQuestionText()}
            <div className="space-y-4 mt-6">
              {renderChoices()}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex gap-6">
        <div className="flex-1">
          {renderQuestionText()}
          <div className="space-y-4 mt-6">
            {renderChoices()}
          </div>
        </div>
        {question.image_url && (
          <div className="flex-1">
            <img
              src={question.image_url}
              alt="Question illustration"
              className="rounded-lg w-full h-auto object-contain"
            />
          </div>
        )}
      </div>
    );
  };

  const renderChoices = () => (
    <>
      {[1, 2, 3, 4].map((choice) => (
        <div key={choice} className="flex items-center gap-2">
          <Button
            variant={selectedAnswer === choice ? "default" : "outline"}
            className={`w-full justify-start h-auto p-4 ${
              selectedAnswer !== null
                ? choice === question.correct_answer
                  ? "bg-[#F2FCE2] hover:bg-[#F2FCE2] text-gray-900 font-medium"
                  : choice === selectedAnswer
                  ? "bg-[#FFF1F2] hover:bg-[#FFF1F2] text-gray-900 font-medium"
                  : "text-gray-900 font-medium"
                : ""
            }`}
            onClick={() => handleAnswerSelect(choice)}
            disabled={selectedAnswer !== null}
          >
            {question[`choice${choice}` as keyof Question]}
            {selectedAnswer !== null && choice === question.correct_answer && (
              <CheckCircle className="ml-2 h-4 w-4 text-green-600" />
            )}
            {selectedAnswer !== null &&
              choice === selectedAnswer &&
              choice !== question.correct_answer && (
                <XCircle className="ml-2 h-4 w-4 text-red-600" />
              )}
          </Button>
          {selectedAnswer === choice &&
            choice !== question.correct_answer &&
            question.explanation && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                  >
                    <Info className="h-4 w-4" />
                    See why
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader className="relative">
                    <AlertDialogTitle>Explanation</AlertDialogTitle>
                    <AlertDialogDescription>
                      {question.explanation}
                    </AlertDialogDescription>
                    <AlertDialogClose className="absolute right-0 top-0">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </AlertDialogClose>
                  </AlertDialogHeader>
                </AlertDialogContent>
              </AlertDialog>
            )}
        </div>
      ))}
    </>
  );

  return (
    <Card className="p-6">
      {renderContent()}
    </Card>
  );
};