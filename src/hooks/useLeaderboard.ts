
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeaderboardEntry } from "@/types/leaderboard";
import { useToast } from "@/hooks/use-toast";

export function useLeaderboard() {
  const { toast } = useToast();

  const { data: overallLeaderboard, isLoading: isLoadingOverall } = useQuery({
    queryKey: ["overall-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("overall_leaderboard")
        .select("*")
        .limit(10);

      if (error) {
        toast({
          title: "Error fetching leaderboard",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Transform data to include all required fields
      return data.map(entry => ({
        ...entry,
        weekly_points: 0, // Add missing field for TypeScript
      })) as LeaderboardEntry[];
    },
  });

  const { data: weeklyLeaderboard, isLoading: isLoadingWeekly } = useQuery({
    queryKey: ["weekly-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_leaderboard")
        .select("*")
        .limit(10);

      if (error) {
        toast({
          title: "Error fetching weekly leaderboard",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Transform data to include all required fields
      return data.map(entry => ({
        ...entry,
        total_points: 0, // Add missing field for TypeScript
      })) as LeaderboardEntry[];
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ["current-user-rank"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const [overallRank, weeklyRank] = await Promise.all([
        supabase
          .from("overall_leaderboard")
          .select("*")
          .eq("user_id", session.user.id)
          .single(),
        supabase
          .from("weekly_leaderboard")
          .select("*")
          .eq("user_id", session.user.id)
          .single(),
      ]);

      return {
        overall: overallRank.data ? {
          ...overallRank.data,
          weekly_points: 0, // Add missing field for overall entries
        } : null,
        weekly: weeklyRank.data ? {
          ...weeklyRank.data,
          total_points: 0, // Add missing field for weekly entries
        } : null,
      };
    },
  });

  return {
    overallLeaderboard,
    weeklyLeaderboard,
    currentUser,
    isLoadingOverall,
    isLoadingWeekly,
  };
}
