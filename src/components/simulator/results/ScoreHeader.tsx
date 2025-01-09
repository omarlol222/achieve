import { format } from "date-fns";

type ScoreHeaderProps = {
  subjectScores: {
    name: string;
    score: number;
  }[];
  totalScore: number;
  createdAt: string;
};

export function ScoreHeader({ subjectScores, totalScore, createdAt }: ScoreHeaderProps) {
  // Filter out duplicate subjects by name, keeping only the first occurrence
  const uniqueSubjectScores = subjectScores.filter(
    (subject, index, self) =>
      index === self.findIndex((s) => s.name === subject.name)
  );

  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-4xl font-bold mb-2">Test score:</h1>
        <div className="space-y-2">
          {uniqueSubjectScores.map((subject) => (
            <p key={subject.name} className="text-xl">
              <span className="font-medium">{subject.name.toUpperCase()}: </span>
              {subject.score}
            </p>
          ))}
          <p className="text-xl">
            <span className="font-medium">TOTAL: </span>
            {totalScore}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-gray-600">
          DATE: {format(new Date(createdAt), "dd/MM/yyyy")}
        </p>
        <p className="text-gray-600">
          TIME: {format(new Date(createdAt), "HH:mm")}
        </p>
      </div>
    </div>
  );
}
