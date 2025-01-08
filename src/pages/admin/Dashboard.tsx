import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  BookOpen,
  CreditCard,
  Users,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Stat = {
  name: string;
  value: string;
  icon: any;
  change: string;
  changeType: "positive" | "negative" | "neutral";
};

type UserProgress = {
  user: {
    full_name: string | null;
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

  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["user-progress"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select(`
          questions_attempted,
          questions_correct,
          user_id,
          topic:topics(
            name,
            subject:subjects(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set(data?.map(progress => progress.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      // Map profiles to progress data
      const progressWithProfiles = data?.map(progress => ({
        ...progress,
        user: profiles?.find(profile => profile.id === progress.user_id) || { full_name: 'Unknown User' }
      }));

      return progressWithProfiles as UserProgress[];
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
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div
                className={`rounded-full p-3 ${
                  stat.changeType === "positive"
                    ? "bg-green-100"
                    : stat.changeType === "negative"
                    ? "bg-red-100"
                    : "bg-gray-100"
                }`}
              >
                <stat.icon className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`text-sm ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : stat.changeType === "negative"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {stat.change} from last month
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* User Progress */}
      <Card className="mt-8 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          User Progress
        </h2>
        {isLoadingProgress ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {userProgress?.map((progress, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {progress.user.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {progress.topic.subject.name} - {progress.topic.name}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {Math.round(
                      (progress.questions_correct / progress.questions_attempted) *
                        100
                    )}
                    %
                  </p>
                </div>
                <Progress
                  value={
                    (progress.questions_correct / progress.questions_attempted) *
                    100
                  }
                  className="h-2"
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Activity and Performance Overview cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          {/* Activity content */}
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Performance Overview
          </h2>
          {/* Performance content */}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;