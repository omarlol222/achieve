import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  BookOpen,
  CreditCard,
  Users,
} from "lucide-react";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";

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

  const { data: revenueData } = useQuery({
    queryKey: ["revenue-data"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get current month's revenue
      const { data: currentMonthData, error: currentError } = await supabase
        .from("purchases")
        .select("amount")
        .eq("status", "completed")
        .gte("created_at", thirtyDaysAgo.toISOString());
      
      if (currentError) throw currentError;

      // Get previous month's revenue
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const { data: previousMonthData, error: previousError } = await supabase
        .from("purchases")
        .select("amount")
        .eq("status", "completed")
        .gte("created_at", sixtyDaysAgo.toISOString())
        .lt("created_at", thirtyDaysAgo.toISOString());

      if (previousError) throw previousError;

      const currentRevenue = currentMonthData.reduce((sum, purchase) => sum + Number(purchase.amount), 0);
      const previousRevenue = previousMonthData.reduce((sum, purchase) => sum + Number(purchase.amount), 0);
      
      const percentageChange = previousRevenue === 0 
        ? 100 
        : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

      return {
        total: currentRevenue,
        percentageChange: Math.round(percentageChange),
      };
    },
  });

  const { data: activeUsers } = useQuery({
    queryKey: ["active-users"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count, error } = await supabase
        .from("user_progress")
        .select("*", { count: "exact" })
        .gt("last_activity", thirtyDaysAgo.toISOString());
      
      if (error) throw error;
      return count || 0;
    },
  });

  const stats = [
    {
      name: "Total Revenue",
      value: `SAR ${(revenueData?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CreditCard,
      change: `${revenueData?.percentageChange >= 0 ? '+' : ''}${revenueData?.percentageChange || 0}% from last month`,
      changeType: (revenueData?.percentageChange || 0) >= 0 ? "positive" as const : "negative" as const,
    },
    {
      name: "Active Members",
      value: activeUsers?.toString() || "0",
      icon: Users,
      change: "+20% from last month",
      changeType: "positive" as const,
    },
    {
      name: "Total Questions",
      value: questionsCount?.toString() || "0",
      icon: BookOpen,
      change: "+20% from last month",
      changeType: "positive" as const,
    },
    {
      name: "Total Members",
      value: usersCount?.toString() || "0",
      icon: BarChart,
      change: "+20% from last month",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {stats.map((stat) => (
          <StatsCard key={stat.name} {...stat} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Performance Overview
          </h2>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;