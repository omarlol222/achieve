import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useModuleStart = (sessionId: string | undefined, refetchModuleProgress: () => void) => {
  const { toast } = useToast();

  const startModule = async (moduleId: string) => {
    try {
      const { error } = await supabase
        .from("module_progress")
        .insert({
          session_id: sessionId,
          module_id: moduleId,
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

  return { startModule };
};