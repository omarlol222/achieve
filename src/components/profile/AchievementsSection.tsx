
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Award, Star, Check, CircleCheck, Ribbon, BadgeCheck, Flame, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Achievement = {
  id: string;
  achievement: {
    title: string;
    description: string;
    points_required: number;
    achievement_type: string;
    icon_name: string;
  };
  earned_at: string;
};

type AchievementsSectionProps = {
  achievements: Achievement[];
};

const achievementIcons: Record<string, React.ElementType> = {
  trophy: Trophy,
  award: Award,
  star: Star,
  check: Check,
  "circle-check": CircleCheck,
  ribbon: Ribbon,
  "badge-check": BadgeCheck,
  flame: Flame,
  zap: Zap,
};

const achievementTypeColors: Record<string, { bg: string; text: string; icon: string }> = {
  practice: { bg: "bg-blue-100", text: "text-blue-600", icon: "text-blue-500" },
  accuracy: { bg: "bg-green-100", text: "text-green-600", icon: "text-green-500" },
  streak: { bg: "bg-orange-100", text: "text-orange-600", icon: "text-orange-500" },
  mastery: { bg: "bg-purple-100", text: "text-purple-600", icon: "text-purple-500" },
  difficulty: { bg: "bg-red-100", text: "text-red-600", icon: "text-red-500" },
  time: { bg: "bg-yellow-100", text: "text-yellow-600", icon: "text-yellow-500" },
  challenge: { bg: "bg-indigo-100", text: "text-indigo-600", icon: "text-indigo-500" },
  elite: { bg: "bg-pink-100", text: "text-pink-600", icon: "text-pink-500" },
  general: { bg: "bg-gray-100", text: "text-gray-600", icon: "text-gray-500" },
};

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  
  const filteredAchievements = achievements?.filter(achievement => 
    selectedType === "all" || achievement.achievement.achievement_type === selectedType
  );

  const achievementTypes = ["all", ...new Set(achievements?.map(a => a.achievement.achievement_type) || [])];

  const getAchievementIcon = (iconName: string) => {
    const IconComponent = achievementIcons[iconName] || Trophy;
    return IconComponent;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Achievements</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">View All Achievements</Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-none">
            <SheetHeader>
              <SheetTitle>Your Achievements</SheetTitle>
            </SheetHeader>
            <div className="py-6">
              <div className="flex gap-2 overflow-x-auto pb-4">
                {achievementTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    onClick={() => setSelectedType(type)}
                    className="whitespace-nowrap"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="space-y-4 mt-4">
                {filteredAchievements?.map((achievement) => {
                  const colors = achievementTypeColors[achievement.achievement.achievement_type];
                  const IconComponent = getAchievementIcon(achievement.achievement.icon_name);
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg ${colors.bg} flex items-start gap-4`}
                    >
                      <div className={`p-2 rounded-full ${colors.bg}`}>
                        <IconComponent className={`h-6 w-6 ${colors.icon}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${colors.text}`}>
                          {achievement.achievement.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {achievement.achievement.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Earned {formatDistanceToNow(new Date(achievement.earned_at))} ago
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements?.slice(0, 6).map((achievement) => {
          const colors = achievementTypeColors[achievement.achievement.achievement_type];
          const IconComponent = getAchievementIcon(achievement.achievement.icon_name);
          
          return (
            <Card key={achievement.id} className="p-4 flex items-start gap-3">
              <div className={`p-2 rounded-full ${colors.bg}`}>
                <IconComponent className={`h-4 w-4 ${colors.icon}`} />
              </div>
              <div>
                <h3 className="font-medium">{achievement.achievement.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {achievement.achievement.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Earned {formatDistanceToNow(new Date(achievement.earned_at))} ago
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}
