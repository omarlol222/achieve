import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useModuleScores = (sessionId: string | undefined) => {
  const { toast } = useToast();

  const calculateScores = async () => {
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
        const isVerbal = progress.module.test_type?.name.toLowerCase().includes('verbal') ||
                        progress.module.test_type?.name.toLowerCase().includes('english');
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

      return {
        verbalScore: Math.round(scores?.verbal / (scores?.verbalCount || 1)),
        quantitativeScore: Math.round(scores?.quantitative / (scores?.quantitativeCount || 1)),
        totalScore: Math.round((
          Math.round(scores?.verbal / (scores?.verbalCount || 1)) + 
          Math.round(scores?.quantitative / (scores?.quantitativeCount || 1))
        ) / 2)
      };
    } catch (error: any) {
      console.error("Error calculating scores:", error);
      toast({
        variant: "destructive",
        title: "Error calculating scores",
        description: error.message,
      });
      return { verbalScore: 0, quantitativeScore: 0, totalScore: 0 };
    }
  };

  return { calculateScores };
};