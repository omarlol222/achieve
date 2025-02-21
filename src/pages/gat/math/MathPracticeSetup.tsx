
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePracticeStore } from "@/store/usePracticeStore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type QuestionCount = 10 | 20 | 30 | -1; // -1 represents infinite mode

const MathPracticeSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [questionsCount, setQuestionsCount] = useState<QuestionCount>(10);
  
  // Get reset action from store and reset immediately
  const resetSession = usePracticeStore(state => state.actions.resetSession);
  const setQuestionsAnswered = usePracticeStore(state => state.actions.setQuestionsAnswered);

  useEffect(() => {
    console.log("Resetting session in setup");
    resetSession();
    setQuestionsAnswered(0);
  }, [resetSession, setQuestionsAnswered]);

  const startPractice = async () => {
    setIsCreatingSession(true);
    try {
      // Create a new practice session
      const { data: session, error: sessionError } = await supabase
        .from("practice_sessions")
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          total_questions: questionsCount === -1 ? 999 : questionsCount,
          questions_answered: 0,
          status: 'in_progress',
          subject: 'Math'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Important: Reset questions answered count to 0
      resetSession();
      setQuestionsAnswered(0);
      
      // Navigate to practice page
      navigate(`/gat/math/practice/${session.id}`);
    } catch (error: any) {
      console.error("Error creating practice session:", error);
      toast({
        title: "Error starting practice",
        description: "There was an error starting your practice session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/gat/math")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Math Topics
      </Button>

      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#1B2B2B]">Math Practice</h1>
          <p className="text-lg text-gray-600">
            Start a practice session to improve your math skills
          </p>
        </div>

        <div className="space-y-4">
          <Label className="text-lg font-medium">Number of Questions</Label>
          <RadioGroup
            defaultValue="10"
            onValueChange={(value) => setQuestionsCount(parseInt(value) as QuestionCount)}
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
          size="lg"
          className="w-full"
          onClick={startPractice}
          disabled={isCreatingSession}
        >
          {isCreatingSession ? "Creating Session..." : "Start Practice"}
        </Button>
      </div>
    </div>
  );
};

export default MathPracticeSetup;
