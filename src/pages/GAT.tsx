import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, PenTool, MonitorPlay } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const TopicProgress = ({ name, value, questionsCorrect }: { name: string; value: number; questionsCorrect: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <div className="text-sm font-medium">{name}</div>
      <div className="text-sm text-muted-foreground">{questionsCorrect}/1000</div>
    </div>
    <Progress value={value} className="h-2" />
  </div>
);

const LearningCard = ({
  title,
  icon: Icon,
}: {
  title: string;
  icon: React.ElementType;
}) => (
  <Card className="flex flex-col items-center justify-center p-8 bg-[#1B2B2B] text-white hover:bg-[#243636] transition-colors cursor-pointer">
    <Icon className="w-8 h-8 mb-4" />
    <h3 className="text-xl font-semibold">{title}</h3>
  </Card>
);

const GAT = () => {
  // First, fetch the Achieve test type ID
  const { data: testType, isError: isTestTypeError, isLoading: isTestTypeLoading } = useQuery({
    queryKey: ["testType", "Achieve"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_types")
        .select("id")
        .eq("name", "Achieve")
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Test type 'Achieve' not found");
      return data;
    },
  });

  // Then fetch subjects for Achieve
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
      // Get the current user's ID
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
            Unable to load test type 'Achieve'. Please try refreshing the page.
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

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[#1B2B2B]">Progress</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {subjects && subjects.length > 0 ? (
              subjects.map((subject) => (
                <Card key={subject.id} className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-center">
                    {subject.name}
                  </h3>
                  <div className="space-y-4">
                    {subject.topics && subject.topics.length > 0 ? (
                      subject.topics.map((topic) => {
                        const progress = calculateTopicProgress(topic.id);
                        return (
                          <TopicProgress
                            key={topic.id}
                            name={topic.name}
                            value={progress.percentage}
                            questionsCorrect={progress.questionsCorrect}
                          />
                        );
                      })
                    ) : (
                      <p className="text-center text-muted-foreground">No topics available for this subject</p>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-2">
                <Card className="p-6">
                  <p className="text-center text-muted-foreground">No subjects available</p>
                </Card>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[#1B2B2B]">Learning center</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <LearningCard title="Course" icon={BookOpen} />
            <LearningCard title="Practice" icon={PenTool} />
            <LearningCard title="Achieve Simulator" icon={MonitorPlay} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default GAT;