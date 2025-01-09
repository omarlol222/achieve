import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgressSection } from "@/components/gat/ProgressSection";
import { LearningSection } from "@/components/gat/LearningSection";
import { Navigation } from "@/components/ui/navigation";
import { useToast } from "@/components/ui/use-toast";
import { GATHeader } from "@/components/gat/GATHeader";

export default function GAT() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access GAT practice.",
          variant: "destructive",
        });
        navigate("/signin");
        return;
      }

      const { data: purchases } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "completed")
        .limit(1);

      if (!purchases || purchases.length === 0) {
        toast({
          title: "Purchase Required",
          description: "Please purchase access to use GAT practice.",
          variant: "destructive",
        });
        navigate("/shop");
      }
    };

    checkAccess();
  }, [navigate, toast]);

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
          points: 0
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
        points: 0
      };
    }

    const { points } = topic.progress;
    return {
      percentage: (points / 1000) * 100,
      points: points || 0
    };
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container py-8 space-y-8">
        <GATHeader />
        <ProgressSection
          subjects={userProgress}
          calculateTopicProgress={calculateTopicProgress}
        />
        <LearningSection />
      </div>
    </div>
  );
}
