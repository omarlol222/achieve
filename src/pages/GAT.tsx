import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TopicProgress } from "@/components/gat/TopicProgress";
import { ProgressSection } from "@/components/gat/ProgressSection";
import { LearningSection } from "@/components/gat/LearningSection";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const GAT = () => {
  const navigate = useNavigate();
  const [userProgress, setUserProgress] = useState<any[]>([]);

  const { data: topics } = useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["user_progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (topics && progress) {
      const progressMap = progress.reduce((acc: any, curr: any) => {
        acc[curr.topic_id] = curr;
        return acc;
      }, {});

      const topicsWithProgress = topics.map((topic: any) => ({
        ...topic,
        progress: progressMap[topic.id] || {
          questions_attempted: 0,
          questions_correct: 0,
        },
      }));

      setUserProgress(topicsWithProgress);
    }
  }, [topics, progress]);

  const calculateTopicProgress = (topicId: string) => {
    const topic = userProgress.find(t => t.id === topicId);
    if (!topic) {
      return {
        percentage: 0,
        questionsCorrect: 0
      };
    }
    const { questions_attempted, questions_correct } = topic.progress;
    return {
      percentage: questions_attempted === 0 ? 0 : Math.round((questions_correct / questions_attempted) * 100),
      questionsCorrect: questions_correct || 0
    };
  };

  const handleStartPractice = () => {
    navigate("/practice");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-[#1B2B2B]">GAT</h1>
        </div>

        <ProgressSection
          subjects={userProgress}
          calculateTopicProgress={calculateTopicProgress}
        />

        <div className="flex justify-center">
          <Button
            onClick={handleStartPractice}
            className="bg-[#1B2B2B] hover:bg-[#2C3C3C]"
            size="lg"
          >
            Practice
          </Button>
        </div>

        <LearningSection />
      </div>
    </div>
  );
};

export default GAT;