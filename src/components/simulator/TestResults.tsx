import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ModuleReview } from "./ModuleReview";
import { useState } from "react";
import { format } from "date-fns";

type TestResultsProps = {
  sessionId: string;
  onRestart: () => void;
};

export function TestResults({ sessionId, onRestart }: TestResultsProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: ["test-session", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_sessions")
        .select(`
          *,
          module_progress:module_progress (
            id,
            module:test_modules (
              id,
              name,
              test_type:test_types (
                name
              )
            ),
            module_answers:module_answers (
              id,
              selected_answer,
              question:questions (
                id,
                correct_answer
              )
            )
          )
        `)
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoadingSession) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Loading results...</p>
      </div>
    );
  }

  if (!session) return null;

  // Calculate scores for math and verbal sections
  const calculateSectionScore = (type: string) => {
    if (!session.module_progress) return 0;
    
    const moduleAnswers = session.module_progress
      .filter(progress => progress.module.test_type?.name.toLowerCase() === type.toLowerCase())
      .flatMap(progress => progress.module_answers || []);

    if (moduleAnswers.length === 0) return 0;

    const correctAnswers = moduleAnswers.filter(
      answer => answer.selected_answer === answer.question.correct_answer
    ).length;

    return Math.round((correctAnswers / moduleAnswers.length) * 100);
  };

  // Calculate mistakes for a module
  const calculateModuleMistakes = (moduleProgress: any) => {
    if (!moduleProgress.module_answers) return 0;
    
    return moduleProgress.module_answers.filter(
      (answer: any) => answer.selected_answer !== answer.question.correct_answer
    ).length;
  };

  const mathScore = calculateSectionScore('math');
  const verbalScore = calculateSectionScore('verbal');
  const totalScore = Math.round((mathScore + verbalScore) / 2);

  if (selectedModuleId) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedModuleId(null)}>
          ← Back to Results
        </Button>
        <ModuleReview
          moduleProgressId={selectedModuleId}
          onContinue={() => setSelectedModuleId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Test score:</h1>
          <div className="space-y-2">
            <p className="text-xl">
              <span className="font-medium">MATH: </span>
              {mathScore}
            </p>
            <p className="text-xl">
              <span className="font-medium">VERBAL: </span>
              {verbalScore}
            </p>
            <p className="text-xl">
              <span className="font-medium">TOTAL: </span>
              {totalScore}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-600">
            DATE: {format(new Date(session.created_at), "dd/MM/yyyy")}
          </p>
          <p className="text-gray-600">
            TIME: {format(new Date(session.created_at), "HH:mm")}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {session.module_progress?.map((progress: any) => {
            const totalQuestions = progress.module_answers?.length || 0;
            const mistakes = calculateModuleMistakes(progress);
            
            return (
              <Card key={progress.id} className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">
                  {progress.module.name}
                  <span className="text-sm text-gray-500 block">
                    {progress.module.test_type?.name}
                  </span>
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">TOTAL QUESTIONS: </span>
                    {totalQuestions}
                  </p>
                  <p>
                    <span className="font-medium">MISTAKES: </span>
                    {mistakes}
                  </p>
                </div>
                <Button
                  className="w-full bg-[#1B2B2B] hover:bg-[#2C3C3C]"
                  onClick={() => setSelectedModuleId(progress.id)}
                >
                  See questions
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center">
        <Button 
          size="lg"
          onClick={onRestart}
          className="bg-[#1B2B2B] hover:bg-[#2C3C3C]"
        >
          Start New Test
        </Button>
      </div>
    </div>
  );
}