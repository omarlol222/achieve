import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TestSimulator } from "@/components/test-management/TestSimulator";
import { Navigation } from "@/components/ui/navigation";
import { useNavigate } from "react-router-dom";

export default function Simulator() {
  const navigate = useNavigate();

  const { data: latestTest } = useQuery({
    queryKey: ["latest-test"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: testResult } = await supabase
        .from("test_results")
        .select(`
          *,
          test_question_results(
            *,
            question:questions(
              *,
              topic:topics(
                name,
                subject:subjects(name)
              )
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!testResult) return null;

      // Group questions by subject/topic
      const moduleStats = testResult.test_question_results.reduce((acc, result) => {
        const topicName = result.question.topic.name;
        const subjectName = result.question.topic.subject.name;
        const moduleKey = `${subjectName} - ${topicName}`;
        
        if (!acc[moduleKey]) {
          acc[moduleKey] = {
            id: result.question.topic.id,
            name: moduleKey,
            totalQuestions: 0,
            mistakes: 0
          };
        }
        
        acc[moduleKey].totalQuestions++;
        if (!result.is_correct) {
          acc[moduleKey].mistakes++;
        }
        
        return acc;
      }, {});

      return {
        ...testResult,
        modules: Object.values(moduleStats)
      };
    },
  });

  const handleViewQuestions = (moduleId: string) => {
    // TODO: Implement viewing questions for a specific module
    console.log("View questions for module:", moduleId);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <TestSimulator
        quantitativeScore={latestTest?.total_score || 0}
        verbalScore={0} // TODO: Add verbal score when implemented
        totalScore={latestTest?.total_score || 0}
        testDate={latestTest ? new Date(latestTest.created_at) : new Date()}
        modules={latestTest?.modules || []}
        onViewQuestions={handleViewQuestions}
      />
    </div>
  );
}