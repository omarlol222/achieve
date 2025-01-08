import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { BarChart, Users, BookOpen, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ChangeType = "positive" | "negative" | "neutral";

type Stat = {
  name: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  change: string;
  changeType: ChangeType;
};

const Dashboard = () => {
  const { data: usersCount } = useQuery({
    queryKey: ["users-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact" });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: questionsCount } = useQuery({
    queryKey: ["questions-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("questions")
        .select("*", { count: "exact" });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: totalRevenue } = useQuery({
    queryKey: ["total-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select("amount")
        .eq("status", "completed");
      if (error) throw error;
      return data.reduce((sum, purchase) => sum + Number(purchase.amount), 0);
    },
  });

  const { data: averageScore } = useQuery({
    queryKey: ["average-score"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_results")
        .select("total_score, total_questions");
      if (error) throw error;
      if (!data?.length) return 0;
      const scores = data.map(
        (result) => (result.total_score / result.total_questions) * 100
      );
      return Math.round(
        scores.reduce((sum, score) => sum + score, 0) / scores.length
      );
    },
  });

  const stats: Stat[] = [
    {
      name: "Total Users",
      value: usersCount?.toString() || "0",
      icon: Users,
      change: "+0%",
      changeType: "positive",
    },
    {
      name: "Active Questions",
      value: questionsCount?.toString() || "0",
      icon: BookOpen,
      change: "+0%",
      changeType: "positive",
    },
    {
      name: "Total Revenue",
      value: `SAR ${totalRevenue?.toFixed(2) || "0"}`,
      icon: CreditCard,
      change: "+0%",
      changeType: "positive",
    },
    {
      name: "Avg. Score",
      value: `${averageScore || 0}%`,
      icon: BarChart,
      change: "0%",
      changeType: "neutral",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                <span
                  className={`${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "negative"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {stat.change}
                </span>{" "}
                vs last month
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <div className="mt-4">
            <div className="space-y-4">
              {/* We'll implement the activity feed in the next iteration */}
              <p className="text-sm text-gray-600">No recent activity</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Performance Overview
          </h2>
          <div className="mt-4">
            {/* We'll implement the performance chart in the next iteration */}
            <p className="text-sm text-gray-600">No data available</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;