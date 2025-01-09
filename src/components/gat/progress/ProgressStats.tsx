import { Progress } from "@/components/ui/progress";

type ProgressStatsProps = {
  questionsCorrect: number;
  questionsAttempted: number;
  points: number;
};

export const ProgressStats = ({ 
  questionsCorrect, 
  questionsAttempted,
  points 
}: ProgressStatsProps) => (
  <div className="text-sm text-muted-foreground">
    {questionsCorrect}/{questionsAttempted} questions correct • {points} points
  </div>
);