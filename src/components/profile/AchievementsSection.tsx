
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

type AchievementsSectionProps = {
  achievements: any[];
};

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements?.map((achievement) => (
          <Card key={achievement.id} className="p-4 flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium">{achievement.achievement.title}</h3>
              <p className="text-sm text-muted-foreground">
                {achievement.achievement.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Earned {new Date(achievement.earned_at).toLocaleDateString()}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
