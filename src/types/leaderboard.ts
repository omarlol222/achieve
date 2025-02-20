
export type LeaderboardEntry = {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_points: number;
  weekly_points: number;
  rank: number;
};
