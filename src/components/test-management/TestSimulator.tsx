import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type ModuleStats = {
  id: string;
  name: string;
  totalQuestions: number;
  mistakes: number;
};

type TestSimulatorProps = {
  quantitativeScore?: number;
  verbalScore?: number;
  totalScore?: number;
  testDate: Date;
  modules: ModuleStats[];
  onViewQuestions: (moduleId: string) => void;
};

export function TestSimulator({
  quantitativeScore = 0,
  verbalScore = 0,
  totalScore = 0,
  testDate = new Date(),
  modules = [],
  onViewQuestions
}: TestSimulatorProps) {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header with Scores and DateTime */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-[#1A1F2C]">Test Score</h1>
          <div className="space-y-2">
            <p className="text-lg">
              <span className="font-semibold">QUANTITATIVE:</span> {quantitativeScore}
            </p>
            <p className="text-lg">
              <span className="font-semibold">VERBAL:</span> {verbalScore}
            </p>
            <p className="text-lg">
              <span className="font-semibold">TOTAL:</span> {totalScore}
            </p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-sm text-gray-600">
            DATE: {format(testDate, "dd/MM/yyyy")}
          </p>
          <p className="text-sm text-gray-600">
            TIME: {format(testDate, "HH:mm")}
          </p>
        </div>
      </div>

      {/* Module Details Section */}
      <div>
        <h2 className="text-2xl font-bold text-[#1A1F2C] mb-6">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module) => (
            <Card key={module.id} className="bg-gray-100">
              <CardHeader>
                <CardTitle className="text-center text-lg">{module.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">TOTAL QUESTIONS:</span>{" "}
                    {module.totalQuestions}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">MISTAKES:</span> {module.mistakes}
                  </p>
                </div>
                <Button 
                  className="w-full bg-[#1A1F2C] hover:bg-[#2A2F3C] text-white"
                  onClick={() => onViewQuestions(module.id)}
                >
                  See questions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}