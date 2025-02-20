
import { memo } from "react";

type ProgressStatsProps = {
  points: number | null;
  percentage: number | null;
};

export const ProgressStats = memo(({ points, percentage }: ProgressStatsProps) => {
  if (percentage !== null) {
    return <div className="text-sm text-gray-500">{Math.round(percentage)}%</div>;
  }
  
  return <div className="text-sm text-gray-500">{points || 0} / 1000 pts</div>;
});

ProgressStats.displayName = "ProgressStats";
