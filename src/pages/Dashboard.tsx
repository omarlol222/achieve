import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { data: testTypes, isLoading } = useQuery({
    queryKey: ["user-test-types"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { data, error } = await supabase
        .from("user_product_access")
        .select(`
          products (
            test_type:test_types (
              id,
              name,
              description
            )
          )
        `)
        .eq("user_id", session.user.id)
        .is("expires_at", null);

      if (error) throw error;

      // Transform and deduplicate test types
      const uniqueTestTypes = data.reduce((acc: any[], item: any) => {
        const testType = item.products.test_type;
        if (testType && !acc.some(t => t.id === testType.id)) {
          acc.push(testType);
        }
        return acc;
      }, []);

      return uniqueTestTypes;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">My Dashboard</h1>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {testTypes?.map((testType) => (
          <Card key={testType.id} className="flex flex-col justify-between min-h-[300px]">
            <CardHeader className="flex-1">
              <CardTitle className="text-2xl mb-4">{testType.name}</CardTitle>
              <CardDescription className="text-base">{testType.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button asChild className="w-full py-6 text-lg">
                <Link to={`/${testType.name.toLowerCase()}`}>
                  Access {testType.name} Platform
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;