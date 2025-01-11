import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type SubjectPerformance = {
  subject_name: string;
  avg_score: number;
};

export const PerformanceCard = () => {
  const { data: performance, isLoading } = useQuery({
    queryKey: ["subject-performance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_progress")
        .select(`
          score,
          module:test_modules(
            subject:subjects(name)
          )
        `)
        .not("score", "is", null);

      if (error) throw error;

      // Process data to get average scores by subject
      const subjectScores = data.reduce((acc: { [key: string]: number[] }, curr) => {
        const subjectName = curr.module?.subject?.name;
        if (subjectName && curr.score) {
          if (!acc[subjectName]) {
            acc[subjectName] = [];
          }
          acc[subjectName].push(curr.score);
        }
        return acc;
      }, {});

      const averages: SubjectPerformance[] = Object.entries(subjectScores).map(
        ([subject_name, scores]) => ({
          subject_name,
          avg_score: Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length
          ),
        })
      );

      return averages;
    },
  });

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Performance Overview
      </h2>
      {isLoading ? (
        <div className="animate-pulse space-y-4 mt-4">
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      ) : !performance?.length ? (
        <div className="text-center py-6 text-gray-500">
          No performance data available
        </div>
      ) : (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject_name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg_score" fill="#1B2E35" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};