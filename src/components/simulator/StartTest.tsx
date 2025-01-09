import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain } from "lucide-react";

export function StartTest({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Brain className="h-16 w-16 text-[#1B2B2B]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Ready to Start Your Test?
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            You will go through several modules. Each module has its own time limit
            and set of questions. Make sure you're in a quiet environment before
            starting.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">Important Notes:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>You cannot pause the test once started</li>
              <li>Each module has its own timer</li>
              <li>You can flag questions for review</li>
              <li>You can review your answers before submitting each module</li>
            </ul>
          </div>

          <Button 
            onClick={onStart}
            className="w-full bg-[#1B2B2B] hover:bg-[#2C3C3C] text-white"
          >
            Start Test
          </Button>
        </div>
      </Card>
    </div>
  );
}