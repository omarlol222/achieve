import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

type ModuleReviewProps = {
  moduleProgressId: string;
  onContinue: () => void;
};

export function ModuleReview({ moduleProgressId, onContinue }: ModuleReviewProps) {
  const { data: answers, isLoading } = useQuery({
    queryKey: ["module-answers", moduleProgressId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_answers")
        .select(`
          *,
          question:questions (
            id,
            question_text,
            correct_answer,
            choice1,
            choice2,
            choice3,
            choice4
          )
        `)
        .eq("module_progress_id", moduleProgressId);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Loading review...</p>
      </div>
    );
  }

  const totalQuestions = answers?.length || 0;
  const correctAnswers = answers?.filter(
    (answer) => answer.selected_answer === answer.question.correct_answer
  ).length || 0;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Module Complete!</h2>
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">Score</p>
            <p className="text-4xl font-bold">{score}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Correct Answers</p>
            <p className="text-4xl font-bold">
              {correctAnswers}/{totalQuestions}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {answers?.map((answer) => (
          <Card key={answer.id} className="p-6">
            <div className="flex items-start gap-4">
              {answer.selected_answer === answer.question.correct_answer ? (
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              )}
              <div className="space-y-4 flex-1">
                <p className="font-medium">{answer.question.question_text}</p>
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
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={onContinue}
          className="bg-[#1B2B2B] hover:bg-[#2C3C3C]"
        >
          Continue to Next Module
        </Button>
      </div>
    </div>
  );
}