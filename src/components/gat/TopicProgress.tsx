import { memo, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { ProgressStats } from "./progress/ProgressStats";

type TopicProgressProps = {
  name: string;
  value: number;
};

export const TopicProgress = memo(({ name, value }: TopicProgressProps) => {
  // Memoize the progress percentage calculation
  const progressPercentage = useMemo(() => (value / 1000) * 100, [value]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">{name}</div>
        <ProgressStats points={value} />
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return prevProps.name === nextProps.name && prevProps.value === nextProps.value;
});

TopicProgress.displayName = "TopicProgress";