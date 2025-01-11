import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ModuleTest } from "@/components/simulator/ModuleTest";
import { StartModule } from "@/components/simulator/StartModule";
import { useTestModules } from "./hooks/useTestModules";
import { useModuleProgress } from "./hooks/useModuleProgress";
import { useTestCompletion } from "./hooks/useTestCompletion";

export const TestContainer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const sessionId = location.state?.sessionId;

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

  const { modules, isLoadingModules } = useTestModules(sessionId);
  const { currentModuleIndex, setCurrentModuleIndex } = useTestCompletion();
  const { 
    moduleProgress, 
    isLoadingProgress, 
    handleStartModule, 
    handleCompleteModule 
  } = useModuleProgress({
    sessionId,
    modules,
    currentModuleIndex,
    setCurrentModuleIndex,
    navigate
  });

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
};