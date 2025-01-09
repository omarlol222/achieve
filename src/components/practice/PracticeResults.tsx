import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

type PracticeResultsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCorrect: number;
  totalQuestions: number;
  pointsChange?: number;
};

export function PracticeResults({ 
  open, 
  onOpenChange, 
  totalCorrect, 
  totalQuestions,
  pointsChange 
}: PracticeResultsProps) {
  const navigate = useNavigate();
  const percentage = (totalCorrect / totalQuestions) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-3 text-2xl">
            <Brain className="h-8 w-8 text-[#1B2B2B]" />
            Practice Results
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">
                Overall Score: {percentage.toFixed(1)}%
              </h2>
              <p className="text-lg">
                {totalCorrect} correct out of {totalQuestions} questions
              </p>
              {pointsChange !== undefined && (
                <p className={`text-lg ${pointsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Points {pointsChange >= 0 ? 'increased' : 'decreased'} by{' '}
                  <span className="font-semibold">{Math.abs(pointsChange)}</span>
                </p>
              )}
            </div>
          </Card>

          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => navigate("/practice")}
              className="bg-[#1B2B2B] hover:bg-[#2C3C3C]"
            >
              Start New Practice
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/gat")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}