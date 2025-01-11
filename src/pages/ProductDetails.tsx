import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string | null;
  media_urls: string[];
  media_types: ('image' | 'video')[];
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

      // For now, we'll just use image_url for the carousel
      // In the future, you might want to create a separate product_media table
      const mediaUrls = [];
      const mediaTypes = [];
      
      if (data.image_url) {
        mediaUrls.push(data.image_url);
        mediaTypes.push('image');
      }

      return {
        ...data,
        media_urls: mediaUrls,
        media_types: mediaTypes,
      } as Product;
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
      
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Product Info */}
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-[#1B2E35]">{product.name}</h1>
            
            <div>
              <h2 className="text-xl font-bold text-[#1B2E35] mb-4">PRODUCT DESCRIPTION:</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1B2E35] mb-4">FEATURES:</h2>
              <ul className="space-y-4">
                {product.permissions.map((permission, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-[#1B2E35]" />
                    <span className="text-gray-700">
                      {permission.test_type.name}
                      {permission.has_course && " Course"}
                      {permission.has_simulator && " + Simulator"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Image and Purchase */}
          <div>
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {product.media_urls.map((url, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-[16/9] w-full bg-[#1B2E35] rounded-lg overflow-hidden">
                        {product.media_types[index] === 'video' ? (
                          <video
                            className="w-full h-full object-cover"
                            controls
                            src={url}
                          />
                        ) : (
                          <img
                            src={url}
                            alt={`${product.name} - ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              
              <div className="mt-8 space-y-4">
                <p className="text-6xl font-bold text-[#1B2E35] text-right">
                  {product.price} {product.currency}
                </p>
                
                <Button 
                  className="w-full bg-[#1B2E35] hover:bg-[#1B2E35]/90 text-white text-xl py-6"
                  onClick={handlePurchase}
                >
                  BUY
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;