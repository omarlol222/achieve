import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, ListChecks } from "lucide-react";

type StartModuleProps = {
  module: {
    name: string;
    description?: string;
    time_limit: number;
  };
  onStart: () => void;
};

export function StartModule({ module, onStart }: StartModuleProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {module.name}
          </h2>
          {module.description && (
            <p className="text-gray-600">{module.description}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Time Limit</p>
                <p className="font-semibold">{module.time_limit} minutes</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
              <ListChecks className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Instructions</p>
                <p className="font-semibold">Read carefully</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">Module Rules:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Timer will start as soon as you begin</li>
              <li>You can flag questions for review</li>
              <li>You can review all questions before submitting</li>
              <li>Module will auto-submit when time runs out</li>
            </ul>
          </div>

          <Button 
            onClick={onStart}
            className="w-full bg-[#1B2B2B] hover:bg-[#2C3C3C] text-white"
          >
            Begin Module
          </Button>
        </div>
      </Card>
    </div>
  );
}