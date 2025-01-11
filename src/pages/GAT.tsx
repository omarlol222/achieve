import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedGatRoute } from "@/components/auth/ProtectedGatRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LearningSection } from "@/components/gat/LearningSection";
import { ProgressSection } from "@/components/gat/ProgressSection";
import { useAuth } from "@/hooks/useAuth";

const GAT = () => {
  const { user } = useAuth();

  // Fetch subjects with error handling
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*, topics(id, name)")
        .order("name");
      if (error) {
        console.error("Subjects fetch error:", error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user progress with error handling
  const { data: progress } = useQuery({
    queryKey: ["user-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user ID");
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);
      if (error) {
        console.error("Progress fetch error:", error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  const userProgress = subjects?.map(subject => ({
    id: subject.id,
    name: subject.name,
    topics: subject.topics?.map(topic => ({
      id: topic.id,
      name: topic.name,
      progress: progress?.find(p => p.topic_id === topic.id) || {
        points: 0
      }
    })) || []
  })) || [];

  const calculateTopicProgress = (topicId: string) => {
    const topicProgress = progress?.find(p => p.topic_id === topicId);
    const points = topicProgress?.points || 0;
    return {
      percentage: (points / 1000) * 100,
      points
    };
  };

  return (
    <ProtectedGatRoute>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">GAT Platform</h1>
        
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <ProgressSection 
              subjects={userProgress}
              calculateTopicProgress={calculateTopicProgress}
            />
          </TabsContent>

          <TabsContent value="learning">
            <LearningSection />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedGatRoute>
  );
};

export default GAT;