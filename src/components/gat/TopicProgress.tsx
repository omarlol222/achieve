import { Progress } from "@/components/ui/progress";
import { ProgressStats } from "./progress/ProgressStats";

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
      <ProgressStats 
        questionsCorrect={questionsCorrect}
        questionsAttempted={questionsAttempted}
        points={value}
      />
    </div>
    <Progress value={(value / 1000) * 100} className="h-2" />
  </div>
);