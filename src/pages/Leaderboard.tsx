import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/ui/navigation";
import { Trophy, Award, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Leaderboard() {
  const { data: leaderboardData } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_attempts")
        .select("*")
        .eq("date", new Date().toISOString().split('T')[0])
        .order("questions_answered", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-8">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">Daily Leaderboard</h1>
        </div>

        <div className="bg-gray-100 rounded-lg p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Questions Answered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData?.map((entry, index) => (
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
        </div>
      </div>
    </div>
  );
}