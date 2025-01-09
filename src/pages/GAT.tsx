import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgressSection } from "@/components/gat/ProgressSection";
import { LearningSection } from "@/components/gat/LearningSection";
import { Navigation } from "@/components/ui/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function GAT() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  // Check session and set user ID
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session error:", error);
        toast({
          title: "Authentication Error",
          description: "Please sign in again.",
          variant: "destructive",
        });
        navigate("/signin");
        return;
      }

      if (!session) {
        navigate("/signin");
        return;
      }

      setUserId(session.user.id);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/signin");
      } else if (session) {
        setUserId(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Only fetch data if we have a user ID
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");
      if (error) {
        console.error("Subjects fetch error:", error);
        throw error;
      }
      return data;
    },
    enabled: !!userId,
  });

  const { data: topics } = useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*, subject:subjects(name)")
        .order("name");
      if (error) {
        console.error("Topics fetch error:", error);
        throw error;
      }
      return data;
    },
    enabled: !!userId,
  });

  const { data: progress } = useQuery({
    queryKey: ["user-progress", userId],
    queryFn: async () => {
      if (!userId) throw new Error("No user ID");
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId);
      if (error) {
        console.error("Progress fetch error:", error);
        throw error;
      }
      return data;
    },
    enabled: !!userId,
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

  if (!userId) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container py-8 space-y-8">
        <ProgressSection
          subjects={userProgress}
          calculateTopicProgress={calculateTopicProgress}
        />
        <LearningSection />
      </div>
    </div>
  );
}