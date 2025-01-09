import { format } from "date-fns";

type ScoreHeaderProps = {
  mathScore: number;
  verbalScore: number;
  totalScore: number;
  createdAt: string;
};

export function ScoreHeader({ mathScore, verbalScore, totalScore, createdAt }: ScoreHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-4xl font-bold mb-2">Test score:</h1>
        <div className="space-y-2">
          <p className="text-xl">
            <span className="font-medium">MATH: </span>
            {mathScore}
          </p>
          <p className="text-xl">
            <span className="font-medium">VERBAL: </span>
            {verbalScore}
          </p>
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