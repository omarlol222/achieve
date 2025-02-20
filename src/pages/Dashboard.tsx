
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, BookOpen, Calculator, BrainCircuit, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const {
    data: testTypes,
    isLoading
  } = useQuery({
    queryKey: ["user-test-types"],
    queryFn: async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");
      const {
        data,
        error
      } = await supabase.from("user_product_access").select(`
          products (
            test_type:test_types (
              id,
              name,
              description
            )
          )
        `).eq("user_id", session.user.id).is("expires_at", null);
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
    }
  });

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }

  const getTestTypeIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'gat':
        return <BrainCircuit className="h-12 w-12" />;
      case 'math':
        return <Calculator className="h-12 w-12" />;
      default:
        return <BookOpen className="h-12 w-12" />;
    }
  };

  const getTestTypeUrl = (name: string) => {
    return name.toLowerCase() === 'gat' ? '/gat' : `/gat/${name.toLowerCase()}`;
  };

  return <div className="container py-8">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          My Dashboard
        </h1>
      </div>

      <div className="grid gap-8 mb-8">
        <Card className="group relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <Link to="/gat/leaderboard" className="block">
            
          </Link>
        </Card>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {testTypes?.map(testType => <Card key={testType.id} className="group relative flex flex-col justify-between min-h-[300px] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <CardHeader className="flex-1 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  {getTestTypeIcon(testType.name)}
                </div>
              </div>
              <CardTitle className="text-2xl mb-4 text-gray-800">
                {testType.name}
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                {testType.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <Link to={getTestTypeUrl(testType.name)} className="block w-full">
                <Button className="w-full py-6 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                  Access {testType.name} Platform
                </Button>
              </Link>
            </CardContent>
          </Card>)}
      </div>
    </div>;
};

export default Dashboard;
