import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, PenTool, MonitorPlay } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  // First, fetch the GAT test type ID
  const { data: testType } = useQuery({
    queryKey: ["testType", "GAT"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_types")
        .select("id")
        .eq("name", "GAT")
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Then fetch subjects for GAT
  const { data: subjects } = useQuery({
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
      return data;
    },
  });

  // Fetch user progress for all topics
  const { data: userProgress } = useQuery({
    queryKey: ["userProgress"],
    queryFn: async () => {
      const { data: progress, error } = await supabase
        .from("user_progress")
        .select("*");
      if (error) throw error;
      return progress;
    },
  });

  // Calculate progress for each topic
  const calculateTopicProgress = (topicId: string) => {
    const progress = userProgress?.find(p => p.topic_id === topicId);
    if (!progress) return { percentage: 0, questionsCorrect: 0 };
    return {
      percentage: progress.questions_attempted > 0
        ? (progress.questions_correct / progress.questions_attempted) * 100
        : 0,
      questionsCorrect: progress.questions_correct || 0
    };
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-center text-[#1B2B2B]">
          Dashboard
        </h1>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[#1B2B2B]">Progress</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {subjects?.map((subject) => (
              <Card key={subject.id} className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-center">
                  {subject.name}
                </h3>
                <div className="space-y-4">
                  {subject.topics?.map((topic) => {
                    const progress = calculateTopicProgress(topic.id);
                    return (
                      <TopicProgress
                        key={topic.id}
                        name={topic.name}
                        value={progress.percentage}
                        questionsCorrect={progress.questionsCorrect}
                      />
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[#1B2B2B]">Learning center</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <LearningCard title="Course" icon={BookOpen} />
            <LearningCard title="Practice" icon={PenTool} />
            <LearningCard title="GAT Simulator" icon={MonitorPlay} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default GAT;