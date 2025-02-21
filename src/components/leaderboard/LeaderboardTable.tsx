
import { User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderboardEntry } from "@/types/leaderboard";
import { getRankIcon } from "./utils";

interface LeaderboardTableProps {
  data: LeaderboardEntry[] | undefined;
  isLoading: boolean;
  type: 'overall' | 'weekly';
}

export function LeaderboardTable({ data, isLoading, type }: LeaderboardTableProps) {
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
                <span>{entry.rank}</span>
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
}
