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
  media: {
    media_url: string;
    media_type: 'image' | 'video';
  }[];
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
          media:product_media(media_url, media_type),
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

  const hasMedia = (product.media?.length ?? 0) > 0;
  const showCarouselControls = hasMedia || product.image_url;
  const multipleItems = (product.media?.length ?? 0) > 1;

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
            <div className="relative space-y-6">
              <Carousel className="w-full">
                <CarouselContent>
                  {hasMedia ? (
                    product.media.map((media, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-[16/9] w-full bg-[#1B2E35] rounded-lg overflow-hidden">
                          {media.media_type === 'video' ? (
                            <video
                              className="w-full h-full object-cover"
                              controls
                              src={media.media_url}
                            />
                          ) : (
                            <img
                              src={media.media_url}
                              alt={`${product.name} - ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </CarouselItem>
                    ))
                  ) : product.image_url ? (
                    <CarouselItem>
                      <div className="aspect-[16/9] w-full bg-[#1B2E35] rounded-lg overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ) : null}
                </CarouselContent>
                {showCarouselControls && multipleItems && (
                  <>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>
                )}
              </Carousel>
              
              <div className="mt-4 space-y-3">
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