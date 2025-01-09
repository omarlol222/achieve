import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatDistanceStrict } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScoreCard } from "./review/ScoreCard";
import { AnswerCard } from "./review/AnswerCard";

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
              id,
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
    (answer) => answer.selected_answer === answer.question?.correct_answer
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
        <ScoreCard
          score={score}
          correctAnswers={correctAnswers}
          totalQuestions={totalQuestions}
          timeSpent={timeSpent}
        />
      </div>

      <div className="space-y-4">
        {answers.map((answer) => (
          <AnswerCard key={answer.id} answer={answer} />
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