import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

type TopicProgress = {
  topicId: string;
  correctCount: number;
  totalCount: number;
  percentage: number;
  points: number;
};

const PracticeResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, totalQuestions } = location.state || {};

  const { data: topics } = useQuery({
    queryKey: ["topics-results"],
    queryFn: async () => {
      const uniqueTopicIds = [...new Set(results.map((r: any) => r.topicId))];
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .in("id", uniqueTopicIds);
      if (error) throw error;
      return data;
    },
  });

  const calculateTopicProgress = (topicId: string): TopicProgress => {
    const topicResults = results.filter((r: any) => r.topicId === topicId);
    const correctCount = topicResults.filter((r: any) => r.isCorrect).length;
    const totalCount = topicResults.length;
    const percentage = (correctCount / totalCount) * 100;

    let points = 0;
    if (percentage >= 90) points = 50;
    else if (percentage >= 80) points = 30;
    else if (percentage >= 70) points = 20;

    return {
      topicId,
      correctCount,
      totalCount,
      percentage,
      points,
    };
  };

  const totalCorrect = results?.filter((r: any) => r.isCorrect).length || 0;
  const overallPercentage = (totalCorrect / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-[#1B2B2B]">
          Practice Results
        </h1>

        <Card className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">
              Overall Score: {overallPercentage.toFixed(1)}%
            </h2>
            <p className="text-lg">
              {totalCorrect} correct out of {totalQuestions} questions
            </p>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Topic Progress</h2>
          {topics?.map((topic) => {
            const progress = calculateTopicProgress(topic.id);
            return (
              <Card key={topic.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{topic.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {progress.correctCount} correct out of {progress.totalCount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {progress.points > 0 ? (
                      <>
                        <TrendingUp className="text-green-500" />
                        <span className="text-green-500">+{progress.points} points</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="text-red-500" />
                        <span className="text-red-500">No points gained</span>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate("/practice/setup")}>
            Start New Practice
          </Button>
          <Button variant="outline" onClick={() => navigate("/gat")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PracticeResults;