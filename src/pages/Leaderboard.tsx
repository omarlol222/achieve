import { useQuery } from "@tanstack/react-query";
import { Award, Trophy, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { startTransition, Suspense, useState, useTransition } from "react";

export default function Leaderboard() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const today = new Date().toISOString().split('T')[0];

  const { data: leaderboardData, isLoading, error } = useQuery({
    queryKey: ["leaderboard", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_attempts")
        .select("*")
        .eq("date", today)
        .order("questions_answered", { ascending: false })
        .limit(10);

      if (error) {
        toast({
          title: "Error fetching leaderboard",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
    suspense: false, // Disable suspense mode for the query
    staleTime: 1000 * 60, // Cache data for 1 minute
  });

  const handleRefresh = () => {
    startTransition(() => {
      // Wrap the state update in startTransition
      // Your refresh logic here if needed
    });
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container px-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Daily Leaderboard</h1>
        </div>

        <div className="bg-gray-100 rounded-lg p-6">
          <Suspense fallback={
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          }>
            {isLoading || isPending ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                Error loading leaderboard data
              </div>
            ) : !leaderboardData?.length ? (
              <div className="text-center py-12 text-gray-500">
                No attempts recorded today
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Questions Answered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData.map((entry, index) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {index === 0 ? (
                            <Trophy className="h-5 w-5 text-yellow-500" />
                          ) : index === 1 ? (
                            <Award className="h-5 w-5 text-gray-400" />
                          ) : index === 2 ? (
                            <Award className="h-5 w-5 text-amber-600" />
                          ) : (
                            <span className="pl-7">{index + 1}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          {entry.username || "Anonymous User"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.questions_answered}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}