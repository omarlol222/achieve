import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useModuleState = (moduleProgress: { id: string; module_id: string }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitModule = async () => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("module_progress")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", moduleProgress.id);

      if (error) throw error;

      toast({
        title: "Module completed",
        description: "Your answers have been submitted successfully.",
      });
    } catch (error: any) {
      console.error("Error submitting module:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit module. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmitModule,
  };
};