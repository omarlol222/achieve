
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { StatsSection } from "@/components/profile/StatsSection";
import { AchievementsSection } from "@/components/profile/AchievementsSection";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  useEffect(() => {
    if (!session) {
      navigate("/signin");
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/signin");
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    });

    return () => subscription.unsubscribe();
  }, [session, navigate, queryClient]);

  const { data: profileData } = useQuery({
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

  const { data: statistics } = useQuery({
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

  const { data: achievements } = useQuery({
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
            points_required
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

  if (!session) {
    return null; // We'll redirect in the useEffect
  }

  return (
    <div className="container py-8 space-y-8">
      <ProfileOverview profile={profileData} statistics={statistics} />
      <StatsSection statistics={statistics} />
      <AchievementsSection achievements={achievements} />
    </div>
  );
}
