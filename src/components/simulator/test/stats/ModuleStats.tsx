import { memo } from "react";

type ModuleStatsProps = {
  answeredCount: number;
  unansweredCount: number;
  flaggedCount: number;
};

export const ModuleStats = memo(({ answeredCount, unansweredCount, flaggedCount }: ModuleStatsProps) => (
  <div className="grid grid-cols-3 gap-4">
    <div className="rounded-lg border p-4 text-center">
      <div className="text-2xl font-bold text-green-600">{answeredCount}</div>
      <div className="text-sm text-gray-600">Answered</div>
    </div>
    <div className="rounded-lg border p-4 text-center">
      <div className="text-2xl font-bold text-red-600">{unansweredCount}</div>
      <div className="text-sm text-gray-600">Unanswered</div>
    </div>
    <div className="rounded-lg border p-4 text-center">
      <div className="text-2xl font-bold text-yellow-600">{flaggedCount}</div>
      <div className="text-sm text-gray-600">Flagged</div>
    </div>
  </div>
));

ModuleStats.displayName = "ModuleStats";