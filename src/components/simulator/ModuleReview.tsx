import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, Brain, Target } from "lucide-react";
import { formatDistanceStrict } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ModuleReviewProps = {
  moduleProgressId: string;
  onContinue: () => void;
};

export function ModuleReview({ moduleProgressId, onContinue }: ModuleReviewProps) {
  const { data: moduleProgress, isLoading: isLoadingProgress, error: progressError } = useQuery({
    queryKey: ["module-progress", moduleProgressId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_progress")
        .select(`
          *,
          module:test_modules (
            name,
            time_limit,
            subject:subjects (
              name
            )
          )
        `)
        .eq("id", moduleProgressId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Module progress not found");
      return data;
    },
  });

  const { data: answers, isLoading: isLoadingAnswers, error: answersError } = useQuery({
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
            choice4,
            explanation,
            image_url,
            topic:topics (
              name
            )
          )
        `)
        .eq("module_progress_id", moduleProgressId);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No answers found for this module");
      return data;
    },
  });

  if (isLoadingProgress || isLoadingAnswers) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Loading review...</p>
      </div>
    );
  }

  if (progressError || answersError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>
          {progressError?.message || answersError?.message || "Error loading review"}
        </AlertDescription>
      </Alert>
    );
  }

  if (!answers || !moduleProgress) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>
          No data found for this module review
        </AlertDescription>
      </Alert>
    );
  }

  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(
    (answer) => answer.selected_answer === answer.question.correct_answer
  ).length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  
  const timeSpent = moduleProgress.completed_at && moduleProgress.started_at
    ? formatDistanceStrict(
        new Date(moduleProgress.completed_at),
        new Date(moduleProgress.started_at)
      )
    : "N/A";

  return (
    <div className="space-y-8">
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold">Module Complete!</h2>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <Target className="h-8 w-8 text-[#1B2B2B]" />
              </div>
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-3xl font-bold">{score}%</p>
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <Brain className="h-8 w-8 text-[#1B2B2B]" />
              </div>
              <p className="text-sm text-gray-600">Correct Answers</p>
              <p className="text-3xl font-bold">
                {correctAnswers}/{totalQuestions}
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <Clock className="h-8 w-8 text-[#1B2B2B]" />
              </div>
              <p className="text-sm text-gray-600">Time Spent</p>
              <p className="text-3xl font-bold">{timeSpent}</p>
            </div>
            <div className="text-center space-y-2">
              <Progress value={score} className="h-2" />
              <p className="text-sm text-gray-600">Performance</p>
              <p className="text-lg">
                {score >= 80 ? "Excellent!" : score >= 60 ? "Good" : "Needs Improvement"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {answers.map((answer) => (
          <Card key={answer.id} className="p-6">
            <div className="flex items-start gap-4">
              {answer.selected_answer === answer.question.correct_answer ? (
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