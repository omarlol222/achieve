import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Users, BookOpen, CreditCard, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ChangeType = "positive" | "negative" | "neutral";

type Stat = {
  name: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  change: string;
  changeType: ChangeType;
};

type UserProgress = {
  user: {
    full_name: string;
  };
  topic: {
    name: string;
    subject: {
      name: string;
    };
  };
  questions_attempted: number;
  questions_correct: number;
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

  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["user-progress"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select(`
          questions_attempted,
          questions_correct,
          user:profiles(full_name),
          topic:topics(
            name,
            subject:subjects(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserProgress[];
    },
  });

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

      {/* User Progress Section */}
      <Card className="mt-8 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">User Progress</h2>
        </div>
        
        {isLoadingProgress ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="space-y-6">
            {userProgress?.map((progress, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{progress.user.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {progress.topic.subject.name} - {progress.topic.name}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {progress.questions_correct} / {progress.questions_attempted}
                  </p>
                </div>
                <Progress 
                  value={progress.questions_attempted > 0 
                    ? (progress.questions_correct / progress.questions_attempted) * 100 
                    : 0
                  } 
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Keep existing activity and performance cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <div className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">No recent activity</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Performance Overview
          </h2>
          <div className="mt-4">
            <p className="text-sm text-gray-600">No data available</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
