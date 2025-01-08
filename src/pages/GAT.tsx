import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgressSection } from "@/components/gat/ProgressSection";
import { LearningSection } from "@/components/gat/LearningSection";

export default function GAT() {
  const navigate = useNavigate();

  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: topics } = useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*, subject:subjects(name)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["user-progress"],
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

  const userProgress = subjects?.map(subject => ({
    id: subject.id,
    name: subject.name,
    topics: topics
      ?.filter(topic => topic.subject_id === subject.id)
      .map(topic => ({
        id: topic.id,
        name: topic.name,
        progress: progress?.find(p => p.topic_id === topic.id) || {
          questions_attempted: 0,
          questions_correct: 0
        }
      })) || []
  })) || [];

  const calculateTopicProgress = (topicId: string) => {
    const topic = userProgress
      .flatMap(subject => subject.topics)
      .find(topic => topic.id === topicId);

    if (!topic) {
      return {
        percentage: 0,
        questionsCorrect: 0,
        questionsAttempted: 0
      };
    }

    const { questions_attempted, questions_correct } = topic.progress;
    return {
      percentage: questions_attempted === 0 ? 0 : Math.round((questions_correct / questions_attempted) * 100),
      questionsCorrect: questions_correct || 0,
      questionsAttempted: questions_attempted || 0
    };
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">GAT Practice</h1>
      </div>

      <ProgressSection
        subjects={userProgress}
        calculateTopicProgress={calculateTopicProgress}
      />

      <LearningSection />
    </div>
  );
}