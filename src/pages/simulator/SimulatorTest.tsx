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

  const { data: moduleProgress, isLoading: isLoadingProgress } = useQuery({
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
      const { data, error } = await supabase
        .from("module_progress")
        .insert({
          session_id: sessionId,
          module_id: modules[currentModuleIndex].id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refetch module progress
      await moduleProgress.refetch();
    } catch (error: any) {
      console.error("Error starting module:", error);
      toast({
        variant: "destructive",
        title: "Error starting module",
        description: error.message,
      });
    }
  };

  const handleCompleteModule = () => {
    if (modules && currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
    } else {
      // Test completed
      navigate("/gat/simulator");
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