import { Progress } from "@/components/ui/progress";
import { ProgressStats } from "./progress/ProgressStats";

type TopicProgressProps = {
  name: string;
  value: number;
};

export const TopicProgress = ({ name, value }: TopicProgressProps) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <div className="text-sm font-medium">{name}</div>
      <ProgressStats points={value} />
    </div>
    <Progress value={(value / 1000) * 100} className="h-2" />
  </div>
);