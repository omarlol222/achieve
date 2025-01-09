import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ModuleTest } from "@/components/simulator/ModuleTest";
import { StartModule } from "@/components/simulator/StartModule";

export default function SimulatorTest() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const sessionId = location.state?.sessionId;
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      toast({
        variant: "destructive",
        title: "Invalid session",
        description: "Please start a new test from the simulator page.",
      });
      navigate("/gat/simulator");
    }
  }, [sessionId, navigate, toast]);

  const { data: modules, isLoading: isLoadingModules } = useQuery({
    queryKey: ["test-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_modules")
        .select("*")
        .order("order_index");
      
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });

  const { data: moduleProgress, isLoading: isLoadingProgress, refetch: refetchModuleProgress } = useQuery({
    queryKey: ["module-progress", sessionId, currentModuleIndex],
    queryFn: async () => {
      if (!modules) return null;
      
      const { data, error } = await supabase
        .from("module_progress")
        .select("*, module:test_modules(*)")
        .eq("session_id", sessionId)
        .eq("module_id", modules[currentModuleIndex].id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!modules && !!sessionId,
  });

  const handleStartModule = async () => {
    if (!modules) return;
    
    try {
      const { error } = await supabase
        .from("module_progress")
        .insert({
          session_id: sessionId,
          module_id: modules[currentModuleIndex].id,
        })
        .select()
        .single();

      if (error) throw error;
      
      await refetchModuleProgress();
    } catch (error: any) {
      console.error("Error starting module:", error);
      toast({
        variant: "destructive",
        title: "Error starting module",
        description: error.message,
      });
    }
  };

  const handleCompleteModule = async () => {
    if (modules && currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
    } else {
      try {
        // Update test session as completed
        const { error: updateError } = await supabase
          .from("test_sessions")
          .update({
            completed_at: new Date().toISOString()
          })
          .eq("id", sessionId);

        if (updateError) throw updateError;

        // Calculate scores from module progress
        const { data: progressData, error: progressError } = await supabase
          .from("module_progress")
          .select(`
            module:test_modules (
              test_type:test_types (name)
            ),
            module_answers (
              selected_answer,
              question:questions (correct_answer)
            )
          `)
          .eq("session_id", sessionId);

        if (progressError) throw progressError;

        // Calculate verbal and quantitative scores
        const scores = progressData?.reduce((acc: any, progress: any) => {
          const isVerbal = progress.module.test_type?.name.toLowerCase() === 'verbal';
          const totalQuestions = progress.module_answers?.length || 0;
          const correctAnswers = progress.module_answers?.filter(
            (answer: any) => answer.selected_answer === answer.question.correct_answer
          ).length || 0;
          
          const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
          
          if (isVerbal) {
            acc.verbal += score;
            acc.verbalCount++;
          } else {
            acc.quantitative += score;
            acc.quantitativeCount++;
          }
          
          return acc;
        }, { verbal: 0, verbalCount: 0, quantitative: 0, quantitativeCount: 0 });

        const verbalScore = Math.round(scores?.verbal / (scores?.verbalCount || 1));
        const quantitativeScore = Math.round(scores?.quantitative / (scores?.quantitativeCount || 1));
        const totalScore = Math.round((verbalScore + quantitativeScore) / 2);

        // Update session with scores
        const { error: scoresError } = await supabase
          .from("test_sessions")
          .update({
            verbal_score: verbalScore,
            quantitative_score: quantitativeScore,
            total_score: totalScore
          })
          .eq("id", sessionId);

        if (scoresError) throw scoresError;

        // Navigate to results page instead of simulator page
        navigate(`/gat/simulator/results/${sessionId}`);
        
        toast({
          title: "Test completed",
          description: "Your test has been submitted successfully.",
        });
      } catch (error: any) {
        console.error("Error completing test:", error);
        toast({
          variant: "destructive",
          title: "Error completing test",
          description: error.message,
        });
      }
    }
  };

  if (!sessionId) return null;

  if (isLoadingModules || isLoadingProgress) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <p>Loading test...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <p>No modules found for this test.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        {moduleProgress ? (
          <ModuleTest
            moduleProgress={moduleProgress}
            onComplete={handleCompleteModule}
          />
        ) : (
          <StartModule
            module={modules[currentModuleIndex]}
            onStart={handleStartModule}
          />
        )}
      </div>
    </div>
  );
}