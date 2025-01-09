import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type TestResult = {
  id: string;
  created_at: string;
  total_score: number;
  verbal_score?: number;
  quantitative_score?: number;
};

export default function Simulator() {
  const { data: testResults } = useQuery({
    queryKey: ["test-results"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("test_results")
        .select("*")
        .eq("user_id", user.id)
        .eq("mode", "simulator")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TestResult[];
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">GAT SIMULATOR</h1>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Previous tests</h2>
            <Button variant="link" className="text-lg">
              VIEW ALL
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testResults?.map((result) => (
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
                  <Button variant="link" size="sm">
                    VIEW DETAILS
                  </Button>
                </div>

                <div>
                  <p className="text-sm text-gray-600">SCORE:</p>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">VERBAL: </span>
                      {result.verbal_score || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">QUANTITATIVE: </span>
                      {result.quantitative_score || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">TOTAL: </span>
                      {result.total_score}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Button 
              size="lg"
              className="bg-[#1B2B2B] hover:bg-[#243636] text-white px-12"
            >
              START A TEST
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}