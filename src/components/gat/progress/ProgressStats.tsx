type ProgressStatsProps = {
  points: number;
};

export const ProgressStats = ({ points }: ProgressStatsProps) => (
  <div className="text-sm text-muted-foreground">
    {points}/1000 points
  </div>
);