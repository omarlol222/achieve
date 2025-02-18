
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function English() {
  const navigate = useNavigate();

  // First, fetch the English subject
  const { data: subject } = useQuery({
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
  const { data: topics } = useQuery({
    queryKey: ["english-topics", subject?.id],
    queryFn: async () => {
      if (!subject?.id) return null;

      const { data, error } = await supabase
        .from("topics")
        .select(`
          id,
          name,
          user_progress (
            points
          )
        `)
        .eq("subject_id", subject.id);

      if (error) throw error;
      return data;
    },
    enabled: !!subject?.id,
  });

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
            {topics?.map((topic) => (
              <Card key={topic.id} className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{topic.name}</h3>
                  <span className="text-sm text-gray-500">
                    {topic.user_progress?.[0]?.points || 0} points
                  </span>
                </div>
                <Progress 
                  value={Math.min((topic.user_progress?.[0]?.points || 0) / 10, 100)} 
                  className="h-2"
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
