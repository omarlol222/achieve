import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Shop = () => {
  const navigate = useNavigate();

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          media:product_media(media_url, media_type),
          permissions:product_permissions(
            has_course,
            has_simulator,
            test_type:test_types(name)
          )
        `)
        .eq('status', 'active');

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <h1 className="text-4xl font-bold text-[#1B2E35] mb-12">Our Products</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products?.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div 
                className="h-48 bg-cover bg-center bg-gray-100"
                style={{ 
                  backgroundImage: product.thumbnail_url ? `url(${product.thumbnail_url})` : 'none',
                }}
              />
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
                <p className="text-gray-600 line-clamp-2">{product.description}</p>
                <p className="text-2xl font-bold mt-4">{product.price} {product.currency}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button 
                  className="w-full"
                  onClick={() => navigate(`/shop/${product.id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;