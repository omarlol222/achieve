import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string | null;
  permissions: {
    has_course: boolean;
    has_simulator: boolean;
    test_type: {
      name: string;
    };
  }[];
}

const ProductDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          permissions:product_permissions(
            has_course,
            has_simulator,
            test_type:test_types(name)
          )
        `)
        .eq("id", id)
        .eq("status", "active")
        .single();

      if (error) {
        toast({
          title: "Error fetching product",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      return data as Product;
    },
  });

  const handlePurchase = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make a purchase",
      });
      return;
    }

    // For now, just show a toast. We'll implement actual purchase later
    toast({
      title: "Coming soon!",
      description: "Purchase functionality will be implemented soon.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          <p className="mt-4 text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Card className="overflow-hidden">
          {product.image_url && (
            <div className="w-full h-64 bg-gray-100">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-[#1B2E35]">
              {product.name}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              {product.permissions.map((permission, idx) => (
                <Badge key={idx} variant="secondary">
                  {permission.test_type.name}
                  {permission.has_course && " Course"}
                  {permission.has_simulator && " + Simulator"}
                </Badge>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Features</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {product.permissions.map((permission, idx) => (
                  <li key={idx}>
                    Access to {permission.test_type.name}
                    {permission.has_course && " Course Materials"}
                    {permission.has_simulator && " and Practice Simulator"}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 bg-gray-50 mt-6">
            <p className="text-4xl font-bold text-[#1B2E35]">
              {product.price} {product.currency}
            </p>
            <Button 
              className="w-full bg-[#1B2E35] hover:bg-[#2d3f48] text-lg py-6"
              onClick={handlePurchase}
            >
              Purchase Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetails;