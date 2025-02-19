
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SubjectProgress } from "@/components/gat/progress/SubjectProgress";
import { useState } from "react";

type SubjectType = {
  id: string;
  name: string;
}

type UserProgressType = {
  points: number;
}

type SubtopicType = {
  id: string;
  name: string;
  user_progress: UserProgressType[];
}

type TopicType = {
  id: string;
  name: string;
  user_progress: UserProgressType[];
  subtopics: SubtopicType[];
}

export default function Math() {
  const navigate = useNavigate();
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // First, fetch the Math subject
  const { data: subject } = useQuery<SubjectType>({
    queryKey: ["math-subject"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("name", "Math")
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Then fetch progress for all math topics
  const { data: topics } = useQuery<TopicType[]>({
    queryKey: ["math-topics", subject?.id],
    queryFn: async () => {
      if (!subject?.id) return [];

      // First get topics with their progress
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select(`
          id,
          name,
          user_progress (points)
        `)
        .eq("subject_id", subject.id);

      if (topicsError) throw topicsError;
      if (!topicsData) return [];

      // Then for each topic, get its subtopics
      const topicsWithSubtopics = await Promise.all(
        topicsData.map(async (topic) => {
          // Get subtopics
          const { data: subtopicsData, error: subtopicsError } = await supabase
            .from("subtopics")
            .select(`
              id,
              name
            `)
            .eq("topic_id", topic.id);

          if (subtopicsError) throw subtopicsError;
          if (!subtopicsData) return { ...topic, subtopics: [] };

          // For each subtopic, get its progress
          const subtopicsWithProgress = await Promise.all(
            subtopicsData.map(async (subtopic) => {
              const { data: progressData } = await supabase
                .from("user_progress")
                .select("points")
                .eq("topic_id", subtopic.id)
                .maybeSingle();

              return {
                ...subtopic,
                user_progress: progressData ? [{ points: progressData.points }] : [{ points: 0 }]
              };
            })
          );

          return {
            ...topic,
            subtopics: subtopicsWithProgress
          };
        })
      );

      return topicsWithSubtopics;
    },
    enabled: !!subject?.id,
  });

  const calculateTopicProgress = (topicId: string) => {
    const topic = topics?.find(t => t.id === topicId);
    const points = topic?.user_progress?.[0]?.points || 0;
    return {
      points,
      percentage: (points / 1000) * 100
    };
  };

  if (!subject || !topics) {
    return null; // or loading state
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container py-8 space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/gat")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to GAT
        </Button>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-[#1B2B2B]">Math Topics</h1>
            <p className="text-lg text-gray-600">Track your progress in each topic</p>
          </div>

          <div className="space-y-6">
            {topics.map((topic) => (
              <Card key={topic.id} className="p-6">
                <SubjectProgress
                  subject={{
                    id: topic.id,
                    name: topic.name,
                    topics: [{
                      id: topic.id,
                      name: topic.name,
                      progress: { points: topic.user_progress?.[0]?.points || 0 },
                      subtopics: topic.subtopics?.map(st => ({
                        id: st.id,
                        name: st.name,
                        progress: { points: st.user_progress?.[0]?.points || 0 }
                      }))
                    }]
                  }}
                  calculateTopicProgress={calculateTopicProgress}
                  isExpanded={expandedTopic === topic.id}
                  onToggleExpand={() => setExpandedTopic(
                    expandedTopic === topic.id ? null : topic.id
                  )}
                />
              </Card>
            ))}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate("/gat/math/practice")}
          >
            Start Practice
          </Button>
        </div>
      </div>
    </div>
  );
}
