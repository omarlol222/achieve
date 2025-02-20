
import { useQuery } from "@tanstack/react-query";
import { Award, Trophy, Medal, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type LeaderboardEntry = {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_points: number;
  weekly_points: number;
  rank: number;
};

export default function Leaderboard() {
  const { toast } = useToast();

  // Query for overall leaderboard
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
      return data as LeaderboardEntry[];
    },
  });

  // Query for weekly leaderboard
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
      return data as LeaderboardEntry[];
    },
  });

  // Query for current user's rank
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
        overall: overallRank.data,
        weekly: weeklyRank.data,
      };
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="font-mono text-lg">{rank}</span>;
    }
  };

  const LeaderboardTable = ({ data, isLoading, type }: { 
    data: LeaderboardEntry[] | undefined; 
    isLoading: boolean;
    type: 'overall' | 'weekly';
  }) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((entry) => (
            <TableRow key={entry.user_id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {getRankIcon(entry.rank)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {entry.avatar_url ? (
                    <img
                      src={entry.avatar_url}
                      alt={entry.username}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <span>{entry.username}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {type === 'overall' ? entry.total_points : entry.weekly_points}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Leaderboard</h1>

      <Tabs defaultValue="overall" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>

        <TabsContent value="overall">
          <Card className="p-6">
            <LeaderboardTable 
              data={overallLeaderboard} 
              isLoading={isLoadingOverall}
              type="overall"
            />
          </Card>
          {currentUser?.overall && currentUser.overall.rank > 10 && (
            <Card className="mt-4 p-6">
              <h2 className="mb-4 text-lg font-semibold">Your Rank</h2>
              <LeaderboardTable 
                data={[currentUser.overall]} 
                isLoading={false}
                type="overall"
              />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="weekly">
          <Card className="p-6">
            <LeaderboardTable 
              data={weeklyLeaderboard} 
              isLoading={isLoadingWeekly}
              type="weekly"
            />
          </Card>
          {currentUser?.weekly && currentUser.weekly.rank > 10 && (
            <Card className="mt-4 p-6">
              <h2 className="mb-4 text-lg font-semibold">Your Rank</h2>
              <LeaderboardTable 
                data={[currentUser.weekly]} 
                isLoading={false}
                type="weekly"
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
