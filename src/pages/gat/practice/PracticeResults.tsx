
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function PracticeResults() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ["practice-session-results", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const { data: sessionData } = await supabase
        .from("practice_sessions")
        .select("*, practice_answers(is_correct)")
        .eq("id", sessionId)
        .maybeSingle();

      return sessionData;
    }
  });

  const correctAnswers = session?.practice_answers?.filter(a => a.is_correct).length || 0;
  const totalQuestions = session?.total_questions || 0;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return (
    <div className="container max-w-2xl py-8">
      <Card className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Practice Complete!</h1>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{accuracy.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Accuracy</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{correctAnswers}</p>
              <p className="text-sm text-gray-500">Correct Answers</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totalQuestions}</p>
              <p className="text-sm text-gray-500">Total Questions</p>
            </div>
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
