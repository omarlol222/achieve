
import { Trophy, Award, Medal, Star } from "lucide-react";

export function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="text-yellow-500" />;
    case 2:
      return <Medal className="text-gray-400" />;
    case 3:
      return <Award className="text-amber-700" />;
    default:
      return <Star className="text-primary/50" />;
  }
}
