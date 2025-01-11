import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ProductDetails = () => {
  const { id } = useParams();

  const { data: product } = useQuery({
    queryKey: ['product', id],
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
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {product && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column - Description */}
            <div className="space-y-8">
              <h1 className="text-5xl font-bold text-[#1B2E35]">{product.name}</h1>
              
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#1B2E35]">PRODUCT DESCRIPTION:</h2>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#1B2E35]">FEATURES:</h2>
                <ul className="space-y-3">
                  {product.permissions?.map((permission: any, index: number) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="text-[#1B2E35]">✦</span>
                      <span className="text-gray-700">
                        {permission.has_course && `Access to ${permission.test_type.name} Course`}
                        {permission.has_simulator && `Access to ${permission.test_type.name} Simulator`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-5xl font-bold text-[#1B2E35] text-center">
                  {product.price} {product.currency}
                </h2>
                <Button 
                  className="w-full bg-[#1B2E35] hover:bg-[#2d3f48] text-white text-xl py-6"
                >
                  BUY
                </Button>
              </div>
            </div>

            {/* Right Column - Image */}
            <div>
              <Carousel className="w-full">
                <CarouselContent>
                  {product.media?.map((media: any, index: number) => (
                    <CarouselItem key={index}>
                      <div 
                        className="aspect-video rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${media.media_url})` }}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;