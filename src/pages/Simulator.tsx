
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { TestDialog } from "@/components/simulator/TestDialog";
import { useState } from "react";
import { Card } from "@/components/ui/card";

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
              subject:subjects (
                id,
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
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

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

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">GAT Simulator</h1>
          
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">How it works</h2>
            <p className="text-gray-600 mb-6">
              Simulate a full GAT exam with timed modules to evaluate your readiness. 
              Each module focuses on specific subjects and skills, helping you prepare 
              effectively for the actual exam.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
              <li>Complete timed modules sequentially</li>
              <li>Track your progress with detailed analytics</li>
              <li>Review your performance by subject and topic</li>
              <li>Export your results for future reference</li>
            </ul>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="w-full bg-[#1B2B2B] hover:bg-[#2C3C3C]"
              size="lg"
            >
              Start New Test
            </Button>
          </Card>

          {testSessions && testSessions.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Previous Tests</h2>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/gat/simulator/all-tests")}
                >
                  View All Tests
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testSessions.map((session) => (
                  <Card
                    key={session.id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {format(new Date(session.created_at), "MMM d, yyyy")}
                        </p>
                        <div className="space-y-1 mt-2">
                          <p>
                            <span className="font-medium">Verbal:</span>{" "}
                            {session.verbal_score}
                          </p>
                          <p>
                            <span className="font-medium">Quantitative:</span>{" "}
                            {session.quantitative_score}
                          </p>
                          <p>
                            <span className="font-medium">Total:</span>{" "}
                            {session.total_score}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/gat/simulator/results/${session.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <TestDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
        />
      </div>
    </div>
  );
}
