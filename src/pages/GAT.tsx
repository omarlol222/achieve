import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgressSection } from "@/components/gat/ProgressSection";
import { LearningSection } from "@/components/gat/LearningSection";
import { Navigation } from "@/components/ui/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ui/error-boundary/ErrorFallback";

export default function GAT() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

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

  const handleError = (error: Error) => {
    console.error("Error in GAT component:", error);
    toast({
      title: "Error",
      description: "There was a problem loading your data. Please try again.",
      variant: "destructive",
    });
  };

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
    enabled: !!userId,
  });

  // Fetch user progress with error handling
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

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container py-8 space-y-8">
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={handleError}
          onReset={() => window.location.reload()}
        >
          <ProgressSection
            subjects={userProgress}
            calculateTopicProgress={calculateTopicProgress}
          />
          <LearningSection />
        </ErrorBoundary>
      </div>
    </div>
  );
}
