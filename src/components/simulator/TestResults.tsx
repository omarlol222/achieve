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
              subject:subjects (
                id,
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

  const calculateSubjectScore = (subjectId: string) => {
    if (!session.module_progress) return 0;
    
    // Get all answers for this subject
    const moduleAnswers = session.module_progress
      .filter(progress => progress.module.subject?.id === subjectId)
      .flatMap(progress => progress.module_answers || []);

    if (moduleAnswers.length === 0) return 0;

    // Calculate total correct answers
    const correctAnswers = moduleAnswers.filter(
      answer => answer.selected_answer === answer.question.correct_answer
    ).length;

    // Return percentage rounded to nearest whole number
    return Math.round((correctAnswers / moduleAnswers.length) * 100);
  };

  const calculateTopicPerformance = () => {
    if (!session.module_progress) return [];

    const topicStats: { [key: string]: { name: string; correct: number; total: number } } = {};

    session.module_progress.forEach(progress => {
      progress.module_answers?.forEach(answer => {
        if (!answer.question.topic) return;
        
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

  // Get unique subjects from module progress
  const subjects = [...new Set(
    session.module_progress
      ?.filter(progress => progress.module.subject)
      .map(progress => progress.module.subject)
  )];

  // Calculate scores for each subject
  const subjectScores = subjects.map(subject => ({
    name: subject.name,
    score: calculateSubjectScore(subject.id)
  }));

  // Calculate total score as average of all subject scores
  const totalScore = Math.round(
    subjectScores.reduce((acc, subject) => acc + subject.score, 0) / subjectScores.length
  );

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
        subjectScores={subjectScores}
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