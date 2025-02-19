
import { Progress } from "@/components/ui/progress";

type ProgressStatsProps = {
  points: number;
};

export const ProgressStats = ({ points }: ProgressStatsProps) => {
  return (
    <span className="text-sm text-gray-500">
      {points} points
    </span>
  );
};
