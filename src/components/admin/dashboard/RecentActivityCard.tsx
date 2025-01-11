import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

type Activity = {
  id: string;
  user: {
    full_name: string | null;
  };
  module: {
    name: string;
  };
  score: number | null;
  completed_at: string | null;
};

export const RecentActivityCard = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_progress")
        .select(`
          id,
          score,
          completed_at,
          module:test_modules(name),
          test_sessions!inner(
            user:user_id(
              full_name
            )
          )
        `)
        .order("completed_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Transform the data to match the Activity type
      return data.map((item: any) => ({
        id: item.id,
        score: item.score,
        completed_at: item.completed_at,
        user: {
          full_name: item.test_sessions.user.full_name
        },
        module: {
          name: item.module.name
        }
      })) as Activity[];
    },
  });

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
      {isLoading ? (
        <div className="animate-pulse space-y-4 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      ) : !activities?.length ? (
        <div className="text-center py-6 text-gray-500">
          No recent activity
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {activity.user?.full_name || "Unknown User"}
                </p>
                <p className="text-sm text-gray-600">
                  Completed {activity.module?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {activity.score ? `${activity.score}%` : "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {activity.completed_at
                    ? formatDistanceToNow(new Date(activity.completed_at), {
                        addSuffix: true,
                      })
                    : "In progress"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};