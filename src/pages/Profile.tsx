
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { StatsSection } from "@/components/profile/StatsSection";
import { AchievementsSection } from "@/components/profile/AchievementsSection";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { toast } = useToast();
  const userId = supabase.auth.getUser()?.data?.user?.id;

  const { data: profileData } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error fetching profile",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
      return data;
    },
    enabled: !!userId,
  });

  const { data: statistics } = useQuery({
    queryKey: ["statistics", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("user_subtopic_progress")
        .select(`
          *,
          subtopic: subtopics (
            name,
            topic: topics (name)
          )
        `)
        .eq("user_id", userId);

      if (error) {
        toast({
          title: "Error fetching statistics",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
      return data;
    },
    enabled: !!userId,
  });

  const { data: achievements } = useQuery({
    queryKey: ["achievements", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("user_achievements")
        .select(`
          *,
          achievement: achievements (
            title,
            description,
            points_required
          )
        `)
        .eq("user_id", userId);

      if (error) {
        toast({
          title: "Error fetching achievements",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }
      return data;
    },
    enabled: !!userId,
  });

  if (!userId) {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <div className="container py-8 space-y-8">
      <ProfileOverview profile={profileData} statistics={statistics} />
      <StatsSection statistics={statistics} />
      <AchievementsSection achievements={achievements} />
    </div>
  );
}
