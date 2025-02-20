
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { StatsSection } from "@/components/profile/StatsSection";
import { AchievementsSection } from "@/components/profile/AchievementsSection";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAchievementNotification } from "@/components/achievements/AchievementNotification";

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const { showAchievementNotification } = useAchievementNotification();

  const { data: session, isError: isSessionError } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/signin");
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/signin");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/signin");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    });

    // Subscribe to real-time achievement updates
    if (session?.user.id) {
      const channel = supabase
        .channel('achievements')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_achievements',
            filter: `user_id=eq.${session.user.id}`
          },
          async (payload) => {
            // Fetch the achievement details
            const { data: achievement } = await supabase
              .from('achievements')
              .select('*')
              .eq('id', payload.new.achievement_id)
              .single();

            if (achievement) {
              showAchievementNotification(achievement);
              // Invalidate achievements query to refresh the list
              queryClient.invalidateQueries({ queryKey: ["achievements"] });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        subscription.unsubscribe();
      };
    }

    return () => subscription.unsubscribe();
  }, [navigate, queryClient, session?.user.id, showAchievementNotification]);

  const { data: profileData, isError: isProfileError } = useQuery({
    queryKey: ["profile", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
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
    enabled: !!session?.user.id,
  });

  const { data: statistics, isError: isStatsError } = useQuery({
    queryKey: ["statistics", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null;
      const { data, error } = await supabase
        .from("user_subtopic_progress")
        .select(`
          *,
          subtopic: subtopics (
            name,
            topic: topics (name)
          )
        `)
        .eq("user_id", session.user.id);

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
    enabled: !!session?.user.id,
  });

  const { data: achievements, isError: isAchievementsError } = useQuery({
    queryKey: ["achievements", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null;
      const { data, error } = await supabase
        .from("user_achievements")
        .select(`
          *,
          achievement: achievements (
            id,
            title,
            description,
            points_required,
            achievement_type,
            icon_name
          )
        `)
        .eq("user_id", session.user.id);

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
    enabled: !!session?.user.id,
  });

  const { data: allAchievements } = useQuery({
    queryKey: ["all-achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order('points_required', { ascending: true });

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
    enabled: !!session?.user.id,
  });

  if (isLoading) {
    return <div className="container py-8">Loading...</div>;
  }

  if (isSessionError || isProfileError || isStatsError || isAchievementsError) {
    return <div className="container py-8">Error loading profile data</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container py-8 space-y-8">
      <ProfileOverview profile={profileData} statistics={statistics} />
      <StatsSection statistics={statistics} />
      <AchievementsSection 
        achievements={achievements} 
        allAchievements={allAchievements}
      />
    </div>
  );
}
