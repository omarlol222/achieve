
import { memo, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { ProgressStats } from "./progress/ProgressStats";
import { cn } from "@/lib/utils";

type TopicProgressProps = {
  name: string;
  value: number;
  variant?: "default" | "subtle";
  isPercentage?: boolean;
  maxValue?: number;
};

export const TopicProgress = memo(({ 
  name, 
  value, 
  variant = "default", 
  isPercentage = false,
  maxValue = 100
}: TopicProgressProps) => {
  // If value is points, convert to percentage based on maxValue
  const progressPercentage = useMemo(() => 
    isPercentage ? value : Math.min((value / maxValue) * 100, 100), 
    [value, isPercentage, maxValue]
  );

  return (
    <div className={cn("space-y-2", variant === "subtle" && "opacity-80")}>
      {name && (
        <div className={cn(
          "flex justify-between items-center",
          variant === "subtle" && "text-sm font-normal"
        )}>
          <div className={cn(
            "text-sm font-medium",
            variant === "subtle" && "text-sm font-normal"
          )}>
            {name}
          </div>
          <ProgressStats points={isPercentage ? null : value} percentage={isPercentage ? value : null} />
        </div>
      )}
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
         prevProps.variant === nextProps.variant &&
         prevProps.isPercentage === nextProps.isPercentage &&
         prevProps.maxValue === nextProps.maxValue;
});

TopicProgress.displayName = "TopicProgress";
