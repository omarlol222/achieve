
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePracticeStore } from "@/store/usePracticeStore";

const MathPracticeSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
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
          total_questions: 10,
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
