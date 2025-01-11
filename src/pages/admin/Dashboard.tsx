import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  BookOpen,
  CreditCard,
  Users,
} from "lucide-react";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import { UserProgressCard } from "@/components/admin/dashboard/UserProgressCard";
import { RecentActivityCard } from "@/components/admin/dashboard/RecentActivityCard";
import { PerformanceCard } from "@/components/admin/dashboard/PerformanceCard";

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
        .from("test_sessions")
        .select("total_score")
        .not("total_score", "is", null);
      if (error) throw error;
      if (!data?.length) return 0;
      
      const scores = data.map(session => session.total_score || 0);
      return Math.round(
        scores.reduce((sum, score) => sum + score, 0) / scores.length
      );
    },
  });

  const stats = [
    {
      name: "Total Users",
      value: usersCount?.toString() || "0",
      icon: Users,
      change: "+0%",
      changeType: "positive" as const,
    },
    {
      name: "Active Questions",
      value: questionsCount?.toString() || "0",
      icon: BookOpen,
      change: "+0%",
      changeType: "positive" as const,
    },
    {
      name: "Total Revenue",
      value: `SAR ${totalRevenue?.toFixed(2) || "0"}`,
      icon: CreditCard,
      change: "+0%",
      changeType: "positive" as const,
    },
    {
      name: "Avg. Score",
      value: `${averageScore || 0}%`,
      icon: BarChart,
      change: "0%",
      changeType: "neutral" as const,
    },
  ];

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.name} {...stat} />
        ))}
      </div>

      <UserProgressCard 
        userProgress={undefined} 
        isLoading={false} 
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivityCard />
        <PerformanceCard />
      </div>
    </div>
  );
};

export default Dashboard;