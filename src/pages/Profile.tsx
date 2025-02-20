
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { StatsSection } from "@/components/profile/StatsSection";
import { AchievementsSection } from "@/components/profile/AchievementsSection";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { toast } = useToast();
  const userId = supabase.auth.getSession().then(response => response.data.session?.user.id);

  const { data: profileData } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const currentUserId = session.data.session?.user.id;
      
      if (!currentUserId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUserId)
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
  });

  const { data: statistics } = useQuery({
    queryKey: ["statistics", userId],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const currentUserId = session.data.session?.user.id;
      
      if (!currentUserId) return null;
      const { data, error } = await supabase
        .from("user_subtopic_progress")
        .select(`
          *,
          subtopic: subtopics (
            name,
            topic: topics (name)
          )
        `)
        .eq("user_id", currentUserId);

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
  });

  const { data: achievements } = useQuery({
    queryKey: ["achievements", userId],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const currentUserId = session.data.session?.user.id;
      
      if (!currentUserId) return null;
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
        .eq("user_id", currentUserId);

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
  });

  const { data: session } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  if (!session) {
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
