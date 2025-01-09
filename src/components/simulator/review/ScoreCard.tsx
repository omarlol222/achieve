import { Brain, Clock, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type ScoreCardProps = {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: string;
};

export function ScoreCard({ score, correctAnswers, totalQuestions, timeSpent }: ScoreCardProps) {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <Target className="h-8 w-8 text-[#1B2B2B]" />
          </div>
          <p className="text-sm text-gray-600">Score</p>
          <p className="text-3xl font-bold">{score}%</p>
        </div>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <Brain className="h-8 w-8 text-[#1B2B2B]" />
          </div>
          <p className="text-sm text-gray-600">Correct Answers</p>
          <p className="text-3xl font-bold">
            {correctAnswers}/{totalQuestions}
          </p>
        </div>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <Clock className="h-8 w-8 text-[#1B2B2B]" />
          </div>
          <p className="text-sm text-gray-600">Time Spent</p>
          <p className="text-3xl font-bold">{timeSpent}</p>
        </div>
        <div className="text-center space-y-2">
          <Progress value={score} className="h-2" />
          <p className="text-sm text-gray-600">Performance</p>
          <p className="text-lg">
            {score >= 80 ? "Excellent!" : score >= 60 ? "Good" : "Needs Improvement"}
          </p>
        </div>
      </div>
    </Card>
  );
}