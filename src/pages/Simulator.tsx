import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { TestDialog } from "@/components/simulator/TestDialog";
import { useState } from "react";

type TestQuestionResult = {
  id: string;
  question?: {
    test_type?: {
      name: string;
    };
  };
  is_correct: boolean;
  user_answer: number | null;
  time_spent: number;
};

type TestResult = {
  id: string;
  created_at: string;
  total_score: number;
  total_questions: number;
  time_spent: number;
  mode: string | null;
  user_id: string | null;
  test_question_results?: TestQuestionResult[];
};

export default function Simulator() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

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
            is_correct,
            user_answer,
            time_spent,
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

  const calculateSectionScore = (result: TestResult, type: string) => {
    if (!result.test_question_results) return 0;
    
    const sectionQuestions = result.test_question_results.filter(
      qr => qr.question?.test_type?.name.toLowerCase() === type.toLowerCase()
    );

    if (sectionQuestions.length === 0) return 0;

    const correctAnswers = sectionQuestions.filter(qr => qr.is_correct).length;
    return Math.round((correctAnswers / sectionQuestions.length) * 100);
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