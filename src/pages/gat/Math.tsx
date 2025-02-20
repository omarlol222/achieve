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

const MathComponent = () => {
  const navigate = useNavigate();
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

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

  const { data: topics } = useQuery({
    queryKey: ["math-topics", subject?.id],
    queryFn: async () => {
      if (!subject?.id) return [];

      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select(`
          id,
          name,
          subtopics (
            id,
            name,
            user_subtopic_progress (
              current_score
            )
          )
        `)
        .eq("subject_id", subject.id);

      if (topicsError) throw topicsError;
      if (!topicsData) return [];

      return topicsData.map(topic => ({
        id: topic.id,
        name: topic.name,
        progress: { percentage: 0 },
        subtopics: (topic.subtopics || []).map(st => ({
          id: st.id,
          name: st.name,
          progress: {
            points: st.user_subtopic_progress?.[0]?.current_score || 0
          }
        }))
      }));
    },
    enabled: !!subject?.id,
  });

  const calculateTopicProgress = (topicId: string) => {
    const topic = topics?.find(t => t.id === topicId);
    if (!topic || !topic.subtopics) return { percentage: 0 };

    const validSubtopics = topic.subtopics.filter(st => st && st.progress && typeof st.progress.points === 'number');
    if (validSubtopics.length === 0) return { percentage: 0 };

    const subtopicPercentages = validSubtopics.map(st => 
      Math.min((st.progress.points / 500) * 100, 100)
    );

    const totalPercentage = subtopicPercentages.reduce((sum, percentage) => sum + percentage, 0);
    const averagePercentage = totalPercentage / validSubtopics.length;
    
    return {
      percentage: averagePercentage
    };
  };

  if (!subject || !topics) {
    return null;
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
                      progress: { percentage: calculateTopicProgress(topic.id).percentage },
                      subtopics: topic.subtopics
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

export default MathComponent;
