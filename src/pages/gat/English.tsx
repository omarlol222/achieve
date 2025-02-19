
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

type UserProgress = {
  points: number;
}

type SubtopicType = {
  id: string;
  name: string;
  user_progress: UserProgress[];
}

type TopicType = {
  id: string;
  name: string;
  user_progress: UserProgress[];
  subtopics: SubtopicType[];
}

export default function English() {
  const navigate = useNavigate();
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // First, fetch the English subject
  const { data: subject } = useQuery<SubjectType>({
    queryKey: ["english-subject"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("name", "English")
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Then fetch progress for all English topics
  const { data: topics } = useQuery<TopicType[]>({
    queryKey: ["english-topics", subject?.id],
    queryFn: async () => {
      if (!subject?.id) return [];

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return [];

      // First get topics with their progress
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select(`
          id,
          name,
          user_progress!inner (
            points
          )
        `)
        .eq("subject_id", subject.id)
        .eq("user_progress.user_id", userId);

      if (topicsError) throw topicsError;
      if (!topicsData) return [];

      // Then for each topic, get its subtopics with their progress
      const topicsWithSubtopics = await Promise.all(
        topicsData.map(async (topic) => {
          const { data: subtopicsData, error: subtopicsError } = await supabase
            .from("subtopics")
            .select(`
              id,
              name,
              user_progress!inner (
                points
              )
            `)
            .eq("topic_id", topic.id)
            .eq("user_progress.user_id", userId);

          if (subtopicsError) throw subtopicsError;

          // Transform the data to match our types
          const transformedTopic: TopicType = {
            id: topic.id,
            name: topic.name,
            user_progress: topic.user_progress || [],
            subtopics: (subtopicsData || []).map(st => ({
              id: st.id,
              name: st.name,
              user_progress: st.user_progress || []
            }))
          };

          return transformedTopic;
        })
      );

      return topicsWithSubtopics;
    },
    enabled: !!subject?.id,
  });

  const calculateTopicProgress = (topicId: string) => {
    if (!topics) return { points: 0, percentage: 0 };
    const topic = topics.find(t => t.id === topicId);
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
            <h1 className="text-4xl font-bold text-[#1B2B2B]">English Topics</h1>
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
            onClick={() => navigate("/gat/english/practice")}
          >
            Start Practice
          </Button>
        </div>
      </div>
    </div>
  );
}
