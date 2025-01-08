import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProgressSection } from "@/components/gat/ProgressSection";
import { LearningSection } from "@/components/gat/LearningSection";
import { useNavigate } from "react-router-dom";

const GAT = () => {
  const navigate = useNavigate();

  const { data: testType, isError: isTestTypeError, isLoading: isTestTypeLoading } = useQuery({
    queryKey: ["testType", "GAT"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_types")
        .select("id")
        .eq("name", "GAT")
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Test type 'GAT' not found");
      return data;
    },
  });

  // Then fetch subjects for GAT
  const { data: subjects, isError: isSubjectsError, isLoading: isSubjectsLoading } = useQuery({
    queryKey: ["subjects", testType?.id],
    enabled: !!testType?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select(`
          id,
          name,
          topics (
            id,
            name
          )
        `)
        .eq("test_type_id", testType.id);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user progress for all topics
  const { data: userProgress, isLoading: isProgressLoading } = useQuery({
    queryKey: ["userProgress"],
    enabled: !!subjects,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: progress, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return progress || [];
    },
  });

  // Calculate progress for each topic
  const calculateTopicProgress = (topicId: string) => {
    const progress = userProgress?.find(p => p.topic_id === topicId);
    if (!progress) return { percentage: 0, questionsCorrect: 0 };
    
    const questionsCorrect = progress.questions_correct || 0;
    const questionsAttempted = progress.questions_attempted || 0;
    
    return {
      percentage: questionsAttempted > 0
        ? (questionsCorrect / questionsAttempted) * 100
        : 0,
      questionsCorrect
    };
  };

  const handleStartPractice = () => {
    navigate("/practice/setup");
  };

  if (isTestTypeLoading || isSubjectsLoading || isProgressLoading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <h1 className="text-4xl font-bold text-center text-[#1B2B2B]">
            Dashboard
          </h1>
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isTestTypeError) {
    return (
      <div className="min-h-screen bg-white p-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertDescription>
            Unable to load test type 'GAT'. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isSubjectsError) {
    return (
      <div className="min-h-screen bg-white p-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertDescription>
            Unable to load subjects. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-center text-[#1B2B2B]">
          Dashboard
        </h1>

        <ProgressSection 
          subjects={subjects || []} 
          calculateTopicProgress={calculateTopicProgress} 
        />

        <LearningSection />
      </div>
    </div>
  );
};

export default GAT;