
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

type QuestionCount = 10 | 20 | 30 | -1; // -1 represents infinite mode

export default function MathPracticeSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
  const [isLoading, setIsLoading] = useState(false);

  const { data: topics } = useQuery({
    queryKey: ["math-practice-topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select(`
          id,
          name,
          subtopics (
            id,
            name
          )
        `)
        .eq("subject_id", (await supabase
          .from("subjects")
          .select("id")
          .eq("name", "Math")
          .single()).data?.id);

      if (error) throw error;
      return data;
    },
  });

  const handleStartPractice = async () => {
    try {
      setIsLoading(true);

      // Create a new practice session
      const { data: session, error: sessionError } = await supabase
        .from("practice_sessions")
        .insert({
          total_questions: questionCount === -1 ? 999 : questionCount,
          questions_answered: 0,
          current_streak: 0,
          total_points: 0,
          status: "in_progress"
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Navigate to practice session
      navigate(`/gat/math/practice/${session.id}`);
    } catch (error: any) {
      toast({
        title: "Error starting practice",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container py-8 space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/gat/math")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Math
        </Button>

        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-[#1B2B2B]">Math Practice</h1>
            <p className="text-lg text-gray-600">
              Customize your practice session
            </p>
          </div>

          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <Label className="text-lg font-medium">Number of Questions</Label>
              <RadioGroup
                defaultValue="10"
                onValueChange={(value) => setQuestionCount(parseInt(value) as QuestionCount)}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="q10"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <RadioGroupItem value="10" id="q10" className="sr-only" />
                  <span className="text-xl font-bold">10</span>
                  <span className="text-sm text-gray-500">Questions</span>
                </Label>
                <Label
                  htmlFor="q20"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <RadioGroupItem value="20" id="q20" className="sr-only" />
                  <span className="text-xl font-bold">20</span>
                  <span className="text-sm text-gray-500">Questions</span>
                </Label>
                <Label
                  htmlFor="q30"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <RadioGroupItem value="30" id="q30" className="sr-only" />
                  <span className="text-xl font-bold">30</span>
                  <span className="text-sm text-gray-500">Questions</span>
                </Label>
                <Label
                  htmlFor="infinite"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <RadioGroupItem value="-1" id="infinite" className="sr-only" />
                  <span className="text-xl font-bold">∞</span>
                  <span className="text-sm text-gray-500">Infinite Mode</span>
                </Label>
              </RadioGroup>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleStartPractice}
              disabled={isLoading}
            >
              Start Practice
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
