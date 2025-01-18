import { memo, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { ProgressStats } from "./progress/ProgressStats";
import { cn } from "@/lib/utils";

type TopicProgressProps = {
  name: string;
  value: number;
  variant?: "default" | "subtle";
};

export const TopicProgress = memo(({ name, value, variant = "default" }: TopicProgressProps) => {
  const progressPercentage = useMemo(() => (value / 1000) * 100, [value]);

  return (
    <div className={cn("space-y-2", variant === "subtle" && "opacity-80")}>
      <div className="flex justify-between items-center">
        <div className={cn(
          "text-sm font-medium",
          variant === "subtle" && "text-sm font-normal"
        )}>
          {name}
        </div>
        <ProgressStats points={value} />
      </div>
      <Progress 
        value={progressPercentage} 
        className={cn(
          "h-2",
          variant === "subtle" && "h-1.5"
        )} 
      />
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.name === nextProps.name && 
         prevProps.value === nextProps.value && 
         prevProps.variant === nextProps.variant;
});

TopicProgress.displayName = "TopicProgress";