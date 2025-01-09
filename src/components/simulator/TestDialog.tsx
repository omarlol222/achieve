import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StartTest } from "./StartTest";
import { StartModule } from "./StartModule";
import { ModuleTest } from "./ModuleTest";
import { TestResults } from "./TestResults";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type TestModule = {
  id: string;
  name: string;
  description?: string;
  time_limit: number;
  test_type_id?: string;
};

type ModuleProgress = {
  id: string;
  module: TestModule;
};

type TestSession = {
  id: string;
  started_at: string;
  completed_at?: string | null;
};

type TestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TestDialog({ open, onOpenChange }: TestDialogProps) {
  const { toast } = useToast();
  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
  const [currentModule, setCurrentModule] = useState<TestModule | null>(null);
  const [showModuleStart, setShowModuleStart] = useState(false);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress | null>(null);

  const createSession = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("test_sessions")
        .insert([{ user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as TestSession;
    },
    onSuccess: (session) => {
      setActiveSession(session);
      if (modules && modules.length > 0) {
        setCurrentModule(modules[0]);
        setShowModuleStart(true);
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error starting test",
        description: error.message,
      });
    },
  });

  const createModuleProgress = useMutation({
    mutationFn: async (moduleId: string) => {
      if (!activeSession) throw new Error("No active session");

      // First check if a module progress already exists
      const { data: existingProgress } = await supabase
        .from("module_progress")
        .select("*")
        .eq("session_id", activeSession.id)
        .eq("module_id", moduleId)
        .maybeSingle();

      if (existingProgress) {
        toast({
          variant: "destructive",
          title: "Module already started",
          description: "You have already started this module.",
        });
        throw new Error("Module already started");
      }

      const { data, error } = await supabase
        .from("module_progress")
        .insert([{
          session_id: activeSession.id,
          module_id: moduleId,
          started_at: new Date().toISOString(),
        }])
        .select(`
          id,
          module:test_modules (
            id,
            name,
            time_limit,
            test_type_id
          )
        `)
        .maybeSingle();

      if (error) {
        console.error("Error creating module progress:", error);
        throw error;
      }
      if (!data) {
        throw new Error("Failed to create module progress");
      }
      return data as ModuleProgress;
    },
    onSuccess: (progress) => {
      setModuleProgress(progress);
      setShowModuleStart(false);
      toast({
        title: "Module started",
        description: "Good luck!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error starting module",
        description: error.message,
      });
    },
  });

  const handleStartTest = () => {
    createSession.mutate();
  };

  const handleStartModule = () => {
    if (!currentModule) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No module selected",
      });
      return;
    }
    createModuleProgress.mutate(currentModule.id);
  };

  const handleModuleComplete = async () => {
    if (modules) {
      const currentIndex = modules.findIndex(m => m.id === currentModule?.id);
      if (currentIndex < modules.length - 1) {
        // Move to next module
        setCurrentModule(modules[currentIndex + 1]);
        setShowModuleStart(true);
        setModuleProgress(null);
      } else {
        // Test completed - update session
        if (activeSession?.id) {
          console.log("Completing test session:", activeSession.id);
          const { error } = await supabase
            .from("test_sessions")
            .update({ 
              completed_at: new Date().toISOString(),
              // You might want to calculate and update scores here
            })
            .eq("id", activeSession.id);

          if (error) {
            console.error("Error completing test session:", error);
            toast({
              variant: "destructive",
              title: "Error completing test",
              description: error.message,
            });
            return;
          }

          console.log("Test session completed successfully");
          // Update local state to trigger results view
          setActiveSession(prev => prev ? {
            ...prev,
            completed_at: new Date().toISOString()
          } : null);
        }
      }
    }
  };

  const renderContent = () => {
    if (activeSession?.completed_at) {
      return (
        <TestResults
          sessionId={activeSession.id}
          onRestart={() => {
            setActiveSession(null);
            setCurrentModule(null);
            setShowModuleStart(false);
            setModuleProgress(null);
            onOpenChange(false);
          }}
        />
      );
    }

    if (!activeSession) {
      return <StartTest onStart={handleStartTest} />;
    }

    if (moduleProgress) {
      return (
        <ModuleTest 
          moduleProgress={moduleProgress}
          onComplete={handleModuleComplete}
        />
      );
    }

    if (showModuleStart && currentModule) {
      return <StartModule module={currentModule} onStart={handleStartModule} />;
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
