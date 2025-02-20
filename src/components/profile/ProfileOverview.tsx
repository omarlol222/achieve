
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame } from "lucide-react";

type ProfileOverviewProps = {
  profile: any;
  statistics: any[];
};

export function ProfileOverview({ profile, statistics }: ProfileOverviewProps) {
  const totalQuestions = statistics?.reduce((acc, stat) => acc + (stat.questions_answered || 0), 0) || 0;
  const correctAnswers = statistics?.reduce((acc, stat) => acc + (stat.correct_answers || 0), 0) || 0;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 rounded-full bg-gray-200" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile?.username || "User"}</h1>
          <p className="text-muted-foreground">Member since {new Date(profile?.created_at).toLocaleDateString()}</p>
          
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-medium">{profile?.streak_days || 0} day streak</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <div>
              <span className="font-medium">{Math.round(accuracy)}% accuracy</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between text-sm">
          <span>Total XP</span>
          <span>{correctAnswers * 10} / 1000</span>
        </div>
        <Progress value={(correctAnswers * 10 / 1000) * 100} className="mt-2" />
      </div>
    </Card>
  );
}
