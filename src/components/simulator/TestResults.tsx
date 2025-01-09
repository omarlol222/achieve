import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ModuleReview } from "./ModuleReview";
import { useState } from "react";
import { ScoreHeader } from "./results/ScoreHeader";
import { TopicPerformance } from "./results/TopicPerformance";
import { ModuleDetails } from "./results/ModuleDetails";

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
                correct_answer,
                topic:topics (
                  id,
                  name
                )
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

  const calculateTopicPerformance = () => {
    if (!session.module_progress) return [];

    const topicStats: { [key: string]: { name: string; correct: number; total: number } } = {};

    session.module_progress.forEach(progress => {
      progress.module_answers?.forEach(answer => {
        const topicId = answer.question.topic.id;
        const topicName = answer.question.topic.name;
        
        if (!topicStats[topicId]) {
          topicStats[topicId] = { name: topicName, correct: 0, total: 0 };
        }
        
        topicStats[topicId].total++;
        if (answer.selected_answer === answer.question.correct_answer) {
          topicStats[topicId].correct++;
        }
      });
    });

    return Object.values(topicStats);
  };

  const mathScore = calculateSectionScore('math');
  const verbalScore = calculateSectionScore('verbal');
  const totalScore = Math.round((mathScore + verbalScore) / 2);
  const topicPerformance = calculateTopicPerformance();

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
      <ScoreHeader
        mathScore={mathScore}
        verbalScore={verbalScore}
        totalScore={totalScore}
        createdAt={session.created_at}
      />

      <TopicPerformance topics={topicPerformance} />

      <ModuleDetails
        modules={session.module_progress}
        onModuleSelect={setSelectedModuleId}
      />

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