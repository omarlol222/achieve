
export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  rank: number;
  total_points: number;
  weekly_points: number;
}
