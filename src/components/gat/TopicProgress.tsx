import { Progress } from "@/components/ui/progress";

type TopicProgressProps = {
  name: string;
  value: number;
  questionsCorrect: number;
  questionsAttempted: number;
};

export const TopicProgress = ({ 
  name, 
  value, 
  questionsCorrect,
  questionsAttempted 
}: TopicProgressProps) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <div className="text-sm font-medium">{name}</div>
      <div className="text-sm text-muted-foreground">
        {questionsCorrect}/{questionsAttempted}
      </div>
    </div>
    <Progress value={value} className="h-2" />
  </div>
);