import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { TestDialog } from "@/components/simulator/TestDialog";
import { useState } from "react";

export default function Simulator() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: testSessions } = useQuery({
    queryKey: ["test-sessions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("test_sessions")
        .select(`
          *,
          module_progress:module_progress (
            module:test_modules (
              test_type:test_types (
                name
              )
            ),
            module_answers:module_answers (
              selected_answer,
              question:questions (
                correct_answer
              )
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const calculateSectionScore = (session: any, type: string) => {
    if (!session.module_progress) return 0;
    
    const moduleAnswers = session.module_progress
      .filter((progress: any) => progress.module.test_type?.name.toLowerCase() === type.toLowerCase())
      .flatMap((progress: any) => progress.module_answers || []);

    if (moduleAnswers.length === 0) return 0;

    const correctAnswers = moduleAnswers.filter(
      (answer: any) => answer.selected_answer === answer.question.correct_answer
    ).length;

    return Math.round((correctAnswers / moduleAnswers.length) * 100);
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

        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-bold">Previous tests</h2>
          </div>

          {!testSessions || testSessions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl text-gray-500 font-light mb-16">
                You don't have any previous tests... Take one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testSessions.map((session) => {
                const mathScore = calculateSectionScore(session, 'math');
                const verbalScore = calculateSectionScore(session, 'verbal');
                const totalScore = Math.round((mathScore + verbalScore) / 2);

                return (
                  <div
                    key={session.id}
                    className="bg-gray-100 p-6 rounded-lg space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-600">DATE:</p>
                        <p className="font-medium">
                          {format(new Date(session.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Button 
                        variant="link" 
                        size="sm"
                        onClick={() => navigate(`/gat/simulator/results/${session.id}`)}
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
              onClick={() => setDialogOpen(true)}
              className="bg-[#1B2B2B] hover:bg-[#2C3C3C] text-white px-12 py-6 text-lg h-auto"
            >
              START A TEST
            </Button>
          </div>
        </div>

        <TestDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
        />
      </div>
    </div>
  );
}