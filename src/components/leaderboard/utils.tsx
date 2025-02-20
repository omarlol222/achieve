
import { Trophy, Medal, Award } from "lucide-react";

export function getRankIcon(rank: number) {
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
}
