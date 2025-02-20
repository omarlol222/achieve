
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { StatsSection } from "@/components/profile/StatsSection";
import { AchievementsSection } from "@/components/profile/AchievementsSection";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

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

    return () => subscription.unsubscribe();
  }, [navigate, queryClient]);

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

  // Show loading state
  if (isLoading) {
    return <div className="container py-8">Loading...</div>;
  }

  // Handle any errors
  if (isSessionError || isProfileError || isStatsError || isAchievementsError) {
    return <div className="container py-8">Error loading profile data</div>;
  }

  // If there's no session, return null (the useEffect will handle redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="container py-8 space-y-8">
      <ProfileOverview profile={profileData} statistics={statistics} />
      <StatsSection statistics={statistics} />
      <AchievementsSection achievements={achievements} />
    </div>
  );
}
