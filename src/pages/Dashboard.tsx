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

  const { data: accessibleTests, isLoading: isLoadingTests } = useQuery({
    queryKey: ["accessible-tests"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data, error } = await supabase
        .from("user_product_access")
        .select(`
          product:products(
            test_type:test_types(
              id,
              name,
              description
            )
          )
        `)
        .eq("user_id", session.user.id)
        .gte("expires_at", new Date().toISOString());

      if (error) throw error;
      
      // Extract unique test types
      const testTypes = data
        .map(access => access.product?.test_type)
        .filter(Boolean)
        .reduce((unique: any[], testType: any) => {
          if (!unique.some(t => t.id === testType.id)) {
            unique.push(testType);
          }
          return unique;
        }, []);

      return testTypes;
    },
  });

  if (isLoadingProfile || isLoadingTests) {
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
            {accessibleTests?.map((testType: any) => (
              <TestTypeCard
                key={testType.id}
                testType={testType}
                onStart={() => navigate(`/gat`)}
              />
            ))}
            {accessibleTests?.length === 0 && (
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