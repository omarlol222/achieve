import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { data: platforms, isLoading } = useQuery({
    queryKey: ["user-platforms"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { data, error } = await supabase
        .from("user_product_access")
        .select(`
          product_id,
          products (
            id,
            name,
            description,
            product_permissions (
              has_course,
              has_simulator,
              has_practice,
              course_text,
              simulator_text,
              practice_text
            )
          )
        `)
        .eq("user_id", session.user.id)
        .is("expires_at", null);

      if (error) throw error;
      return data;
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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {platforms?.map((platform) => (
          <Card key={platform.product_id}>
            <CardHeader>
              <CardTitle>{platform.products.name}</CardTitle>
              <CardDescription>{platform.products.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {platform.products.product_permissions.map((permission, index) => (
                <div key={index} className="space-y-2">
                  {permission.has_course && (
                    <Button asChild className="w-full">
                      <Link to="/gat">{permission.course_text || "Access Course"}</Link>
                    </Button>
                  )}
                  {permission.has_simulator && (
                    <Button asChild className="w-full">
                      <Link to="/gat/simulator">{permission.simulator_text || "Access Simulator"}</Link>
                    </Button>
                  )}
                  {permission.has_practice && (
                    <Button asChild className="w-full">
                      <Link to="/gat/practice">{permission.practice_text || "Access Practice"}</Link>
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;