
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAchievementNotification } from "@/components/achievements/AchievementNotification";

export function useAchievementHandler(userId: string | undefined) {
  const { showAchievementNotification } = useAchievementNotification();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('achievements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          const { data: achievement } = await supabase
            .from('achievements')
            .select('*')
            .eq('id', payload.new.achievement_id)
            .single();

          if (achievement) {
            showAchievementNotification(achievement);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, showAchievementNotification]);
}
