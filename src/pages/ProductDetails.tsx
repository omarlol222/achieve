import { Navigation } from "@/components/ui/navigation";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductHeader } from "@/components/products/details/ProductHeader";
import { ProductDescription } from "@/components/products/details/ProductDescription";
import { ProductFeatures } from "@/components/products/details/ProductFeatures";
import { ProductGallery } from "@/components/products/details/ProductGallery";
import { ProductPurchase } from "@/components/products/details/ProductPurchase";

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
      
      <main className="pt-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {product && (
            <>
              <ProductHeader name={product.name} />
              
              <div className="flex flex-col lg:flex-row gap-16 items-start">
                {/* Left Column - Description */}
                <div className="flex-1 space-y-8">
                  <ProductDescription description={product.description} />
                  <ProductFeatures permissions={product.permissions} />
                </div>

                {/* Right Column - Image and Buy Button */}
                <div className="lg:w-[600px] space-y-8">
                  <ProductGallery media={product.media} />
                  <ProductPurchase price={product.price} currency={product.currency} />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;