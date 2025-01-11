import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NavigateFunction } from "react-router-dom";

type UseModuleProgressProps = {
  sessionId: string | undefined;
  modules: any[] | undefined;
  currentModuleIndex: number;
  setCurrentModuleIndex: (index: number) => void;
  navigate: NavigateFunction;
};

export const useModuleProgress = ({
  sessionId,
  modules,
  currentModuleIndex,
  setCurrentModuleIndex,
  navigate
}: UseModuleProgressProps) => {
  const { toast } = useToast();

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

        const { error: scoresError } = await supabase
          .from("test_sessions")
          .update({
            verbal_score: verbalScore,
            quantitative_score: quantitativeScore,
            total_score: totalScore,
            completed_at: new Date().toISOString()
          })
          .eq("id", sessionId);

        if (scoresError) throw scoresError;

        navigate(`/gat/simulator/results/${sessionId}`, { replace: true });
        
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

  return {
    moduleProgress,
    isLoadingProgress,
    handleStartModule,
    handleCompleteModule
  };
};