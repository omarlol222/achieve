import { Button } from "@/components/ui/button";
import { ModuleReview } from "./ModuleReview";
import { useState } from "react";
import { ScoreHeader } from "./results/ScoreHeader";
import { TopicPerformance } from "./results/TopicPerformance";
import { ModuleDetails } from "./results/ModuleDetails";
import { calculateTopicPerformance } from "./results/ScoreCalculator";
import { useSessionData } from "./results/hooks/useSessionData";
import { useSessionScores } from "./results/hooks/useSessionScores";

type TestResultsProps = {
  sessionId: string;
  onRestart: () => void;
};

export function TestResults({ sessionId, onRestart }: TestResultsProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const { data: session, isLoading: isLoadingSession } = useSessionData(sessionId);
  const { subjectScores, totalScore } = useSessionScores(session);

  if (isLoadingSession) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Loading results...</p>
      </div>
    );
  }

  if (!session) return null;

  const topicPerformance = calculateTopicPerformance(session.module_progress || []);

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