import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NavigateFunction } from "react-router-dom";
import { useModuleScores } from "./useModuleScores";
import { useModuleStart } from "./useModuleStart";

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
  const { calculateScores } = useModuleScores(sessionId);

  const { 
    data: moduleProgress, 
    isLoading: isLoadingProgress, 
    refetch: refetchModuleProgress 
  } = useQuery({
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

  const { startModule } = useModuleStart(sessionId, refetchModuleProgress);

  const handleStartModule = () => {
    if (!modules) return;
    startModule(modules[currentModuleIndex].id);
  };

  const handleCompleteModule = async () => {
    if (modules && currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    } else {
      try {
        const scores = await calculateScores();

        const { error: scoresError } = await supabase
          .from("test_sessions")
          .update({
            verbal_score: scores.verbalScore,
            quantitative_score: scores.quantitativeScore,
            total_score: scores.totalScore,
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