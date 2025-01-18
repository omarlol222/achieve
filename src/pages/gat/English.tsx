import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, PenTool } from "lucide-react";

export default function English() {
  const navigate = useNavigate();

  const { data: progress } = useQuery({
    queryKey: ["english-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_progress")
        .select(`
          points,
          topic:topics (
            id,
            name
          )
        `)
        .eq("user_id", user.id)
        .eq("topics.subject_id", "english-subject-id"); // Replace with actual English subject ID

      if (error) throw error;
      return data;
    },
  });

  const totalProgress = progress?.reduce((acc, curr) => acc + (curr.points || 0), 0) || 0;
  const progressPercentage = Math.min((totalProgress / 1000) * 100, 100);

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
            <h1 className="text-4xl font-bold text-[#1B2B2B]">English Progress</h1>
            <p className="text-lg text-gray-600">Track your learning journey</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Overall Progress</h2>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-gray-600">
              {totalProgress} points earned
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button
              size="lg"
              className="h-32 flex flex-col items-center justify-center gap-3 text-lg bg-[#1B2B2B] hover:bg-[#2C3C3C]"
              onClick={() => navigate("/gat/practice")}
            >
              <PenTool className="h-8 w-8" />
              Practice Mode
            </Button>

            <Button
              size="lg"
              className="h-32 flex flex-col items-center justify-center gap-3 text-lg bg-[#1B2B2B] hover:bg-[#2C3C3C]"
              onClick={() => navigate("/gat/course")}
            >
              <BookOpen className="h-8 w-8" />
              Course Content
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}