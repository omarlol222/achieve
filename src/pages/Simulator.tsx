import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StartTest } from "@/components/simulator/StartTest";
import { StartModule } from "@/components/simulator/StartModule";
import { ModuleTest } from "@/components/simulator/ModuleTest";
import { TestResults } from "@/components/simulator/TestResults";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type TestResult = {
  id: string;
  created_at: string;
  total_score: number;
  verbal_score?: number;
  quantitative_score?: number;
};

type TestSession = {
  id: string;
  started_at: string;
  completed_at?: string | null;
};

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

export default function Simulator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
  const [currentModule, setCurrentModule] = useState<TestModule | null>(null);
  const [showModuleStart, setShowModuleStart] = useState(false);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress | null>(null);
  
  const { data: testResults } = useQuery({
    queryKey: ["test-results"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("test_results")
        .select(`
          *,
          test_question_results (
            id,
            question:questions (
              test_type:test_types (
                name
              )
            )
          )
        `)
        .eq("user_id", user.id)
        .eq("mode", "simulator")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TestResult[];
    },
  });

  const { data: modules } = useQuery({
    queryKey: ["test-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_modules")
        .select(`
          id,
          name,
          description,
          time_limit,
          test_type_id
        `)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as TestModule[];
    },
  });

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

  const handleStartNewTest = () => {
    setActiveSession(null);
    setCurrentModule(null);
    setShowModuleStart(false);
    setModuleProgress(null);
    queryClient.invalidateQueries({ queryKey: ["test-results"] });
  };

  const calculateSectionScore = (result: TestResult, type: string) => {
    if (!result.test_question_results) return 0;
    
    const sectionQuestions = result.test_question_results.filter(
      qr => qr.question?.test_type?.name.toLowerCase() === type.toLowerCase()
    );

    if (sectionQuestions.length === 0) return 0;

    const correctAnswers = sectionQuestions.filter(qr => qr.is_correct).length;
    return Math.round((correctAnswers / sectionQuestions.length) * 100);
  };

  const renderContent = () => {
    if (activeSession?.completed_at) {
      return (
        <TestResults
          sessionId={activeSession.id}
          onRestart={handleStartNewTest}
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

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-bold">Previous tests</h2>
          <Button 
            variant="link" 
            className="text-lg"
            onClick={() => navigate("/gat/simulator/history")}
          >
            VIEW ALL
          </Button>
        </div>

        {testResults?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl text-gray-500 font-light mb-16">
              You don't have any previous tests... Take one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testResults?.map((result) => {
              const mathScore = calculateSectionScore(result, 'math');
              const verbalScore = calculateSectionScore(result, 'verbal');
              const totalScore = Math.round((mathScore + verbalScore) / 2);

              return (
                <div
                  key={result.id}
                  className="bg-gray-100 p-6 rounded-lg space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">DATE:</p>
                      <p className="font-medium">
                        {format(new Date(result.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => navigate(`/gat/simulator/results/${result.id}`)}
                    >
                      VIEW DETAILS
                    </Button>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">SCORE:</p>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">VERBAL: </span>
                        {verbalScore}
                      </p>
                      <p>
                        <span className="font-medium">MATH: </span>
                        {mathScore}
                      </p>
                      <p>
                        <span className="font-medium">TOTAL: </span>
                        {totalScore}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center mt-12">
          <Button 
            size="lg"
            onClick={() => setActiveSession(null)}
            className="bg-[#1B2B2B] hover:bg-[#2C3C3C] text-white px-12 py-6 text-lg h-auto"
          >
            START A TEST
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/gat")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-5xl font-bold mb-12">GAT SIMULATOR</h1>

        {renderContent()}
      </div>
    </div>
  );
}
