
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

type SubtopicScore = {
  name: string;
  points: number;
  correct: number;
  total: number;
};

export function PracticeResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const { data: results } = useQuery({
    queryKey: ["practice-session-results", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;

      // Get session data with answers and questions joined
      const { data: sessionData } = await supabase
        .from("practice_sessions")
        .select(`
          *,
          practice_answers(
            points_earned,
            is_correct,
            question:questions(
              subtopic:subtopics(
                name
              )
            )
          )
        `)
        .eq("id", sessionId)
        .single();

      if (!sessionData) return null;

      // Calculate subtopic scores
      const subtopicScores: { [key: string]: SubtopicScore } = {};
      
      sessionData.practice_answers.forEach((answer: any) => {
        const subtopicName = answer.question?.subtopic?.name || 'Uncategorized';
        
        if (!subtopicScores[subtopicName]) {
          subtopicScores[subtopicName] = {
            name: subtopicName,
            points: 0,
            correct: 0,
            total: 0
          };
        }
        
        subtopicScores[subtopicName].points += answer.points_earned || 0;
        subtopicScores[subtopicName].total += 1;
        if (answer.is_correct) {
          subtopicScores[subtopicName].correct += 1;
        }
      });

      return {
        session: sessionData,
        subtopicScores: Object.values(subtopicScores),
        totalPoints: sessionData.total_points,
        correctAnswers: sessionData.practice_answers.filter((a: any) => a.is_correct).length,
        totalQuestions: sessionData.total_questions
      };
    }
  });

  if (!results) return <div>Loading...</div>;

  const accuracy = results.totalQuestions > 0 
    ? (results.correctAnswers / results.totalQuestions) * 100 
    : 0;

  return (
    <div className="container max-w-3xl py-8">
      <Card className="p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-center">Practice Complete!</h1>
          <p className="text-center text-muted-foreground">
            Here's how you performed in each area
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{accuracy.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Overall Accuracy</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{results.correctAnswers}</p>
              <p className="text-sm text-gray-500">Correct Answers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{results.totalPoints}</p>
              <p className="text-sm text-gray-500">Total Points</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Performance by Topic</h2>
          <div className="space-y-4">
            {results.subtopicScores.map((score) => (
              <div key={score.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{score.name}</p>
                  <p className="text-sm text-primary font-semibold">
                    {score.points} points
                  </p>
                </div>
                <div className="space-y-1">
                  <Progress 
                    value={(score.correct / score.total) * 100} 
                    className="h-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    {score.correct} of {score.total} correct ({((score.correct / score.total) * 100).toFixed(0)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Return to Practice
          </Button>
          <Button onClick={() => navigate("/gat")}>
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default PracticeResults;
