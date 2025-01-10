import { format } from "date-fns";
import { Card } from "@/components/ui/card";

type ScoreHeaderProps = {
  subjectScores: { name: string; score: number }[];
  totalScore: number;
  createdAt: string;
};

export function ScoreHeader({ subjectScores, totalScore, createdAt }: ScoreHeaderProps) {
  // Map "Math" to "Quantitative" in the display
  const displayScores = subjectScores.map(score => ({
    ...score,
    name: score.name.toLowerCase() === 'math' ? 'Quantitative' : score.name
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Test Results</h1>
        <p className="text-muted-foreground">
          {format(new Date(createdAt), "MMMM d, yyyy")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayScores.map((score) => (
          <Card key={score.name} className="p-6">
            <h3 className="text-lg font-semibold mb-2">{score.name}</h3>
            <p className="text-3xl font-bold">{score.score}</p>
          </Card>
        ))}
        <Card className="p-6 bg-[#1B2B2B] text-white">
          <h3 className="text-lg font-semibold mb-2">Total Score</h3>
          <p className="text-3xl font-bold">{totalScore}</p>
        </Card>
      </div>
    </div>
  );
}