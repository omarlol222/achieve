import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Brain } from "lucide-react";

type Result = {
  questionId: string;
  topicId: string;
  isCorrect: boolean;
};

type TopicProgress = {
  topicId: string;
  correctCount: number;
  totalCount: number;
  percentage: number;
  points: number;
};

type LocationState = {
  results: Result[];
  totalQuestions: number;
};

const PracticeResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, totalQuestions } = (location.state || {}) as LocationState;

  const { data: topics } = useQuery({
    queryKey: ["topics-results"],
    queryFn: async () => {
      const uniqueTopicIds = [...new Set(results?.map(r => r.topicId))] as string[];
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .in("id", uniqueTopicIds);
      if (error) throw error;
      return data;
    },
    enabled: !!results,
  });

  const calculateTopicProgress = (topicId: string): TopicProgress => {
    const topicResults = results?.filter((r) => r.topicId === topicId);
    const correctCount = topicResults?.filter((r) => r.isCorrect).length || 0;
    const totalCount = topicResults?.length || 0;
    const percentage = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

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

  const totalCorrect = results?.filter((r) => r.isCorrect).length || 0;
  const overallPercentage = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 text-[#1B2B2B]" />
          <h1 className="text-3xl font-bold text-center text-[#1B2B2B]">
            Practice Results
          </h1>
        </div>

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
          <Button 
            onClick={() => navigate("/practice/setup")}
            className="bg-[#1B2B2B] hover:bg-[#2C3C3C]"
          >
            Start New Practice
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/gat")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PracticeResults;