
import { Award, Badge, Star, Trophy, Check, CircleCheck, Ribbon, BadgeCheck, Flame, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { type ToastActionElement } from "@/components/ui/toast";

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
  general: { bg: "bg-gray-100", text: "text-gray-600", icon: "text-gray-500" },
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  achievement_type: string;
  icon_name: string;
};

export function useAchievementNotification() {
  const { toast } = useToast();

  const showAchievementNotification = (achievement: Achievement) => {
    const IconComponent = achievementIcons[achievement.icon_name] || Trophy;
    const colors = achievementTypeColors[achievement.achievement_type] || achievementTypeColors.general;

    toast({
      variant: "default",
      duration: 5000,
      className: "achievement-toast",
      description: (
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${colors.bg}`}>
              <IconComponent className={`h-4 w-4 ${colors.icon}`} />
            </div>
            <span className="font-semibold">Achievement Unlocked!</span>
          </div>
          <div className="mt-1">
            <p className="font-semibold">{achievement.title}</p>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
          </div>
        </div>
      ),
    });
  };

  return { showAchievementNotification };
}
