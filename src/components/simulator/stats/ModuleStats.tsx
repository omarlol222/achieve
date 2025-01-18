import { Card } from "@/components/ui/card";
import { Check, Flag, HelpCircle } from "lucide-react";

type ModuleStatsProps = {
  answeredCount: number;
  unansweredCount: number;
  flaggedCount: number;
};

export const ModuleStats = ({
  answeredCount,
  unansweredCount,
  flaggedCount,
}: ModuleStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4 flex items-center gap-3">
        <div className="bg-green-100 p-2 rounded-full">
          <Check className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Answered</p>
          <p className="font-semibold">{answeredCount}</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3">
        <div className="bg-red-100 p-2 rounded-full">
          <HelpCircle className="h-4 w-4 text-red-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Unanswered</p>
          <p className="font-semibold">{unansweredCount}</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center gap-3">
        <div className="bg-yellow-100 p-2 rounded-full">
          <Flag className="h-4 w-4 text-yellow-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Flagged</p>
          <p className="font-semibold">{flaggedCount}</p>
        </div>
      </Card>
    </div>
  );
};