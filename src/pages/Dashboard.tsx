import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, BookOpen } from "lucide-react";
import { UserSettings } from "@/components/dashboard/UserSettings";
import { TestTypeCard } from "@/components/dashboard/TestTypeCard";

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: platformAccess, isLoading: isLoadingAccess } = useQuery({
    queryKey: ["platform-access"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      const { data, error } = await supabase
        .rpc('check_platform_access', {
          user_id: session.user.id,
          platform: 'gat'
        });

      if (error) {
        console.error('Platform access check error:', error);
        return false;
      }
      
      console.log('Platform access result:', data);
      return data;
    },
  });

  const { data: testTypes, isLoading: isLoadingTestTypes } = useQuery({
    queryKey: ["test-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_types")
        .select("*")
        .order('name');

      if (error) {
        console.error('Test types fetch error:', error);
        throw error;
      }
      
      console.log('Test types result:', data);
      return data;
    },
    enabled: platformAccess === true, // Only fetch test types if user has platform access
  });

  if (isLoadingProfile || isLoadingAccess || (platformAccess && isLoadingTestTypes)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <Tabs defaultValue="tests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tests" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            My Platforms
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformAccess ? (
              testTypes?.map((testType) => (
                <TestTypeCard
                  key={testType.id}
                  testType={testType}
                  onStart={() => navigate(`/gat`)}
                />
              ))
            ) : (
              <Card className="p-6 col-span-full">
                <p className="text-center text-gray-500">
                  You don't have access to any platforms yet. Visit our shop to purchase access.
                </p>
                <div className="mt-4 flex justify-center">
                  <Button onClick={() => navigate("/shop")}>
                    Go to Shop
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <UserSettings profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;