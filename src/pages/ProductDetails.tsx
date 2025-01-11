import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/ui/navigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductMedia } from "@/components/product/ProductMedia";
import { ProductPurchase } from "@/components/product/ProductPurchase";

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
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Product ID is required");
      }

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
    enabled: !!id,
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
        <div className="container mx-auto px-4 py-8">
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
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          <p className="mt-4 text-gray-600">
            The product you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Product Info */}
          <ProductInfo
            name={product.name}
            description={product.description}
            permissions={product.permissions}
          />

          {/* Right Column - Image and Purchase */}
          <div className="space-y-4">
            <ProductMedia
              media={product.media}
              imageUrl={product.image_url}
            />
            <ProductPurchase
              price={product.price}
              currency={product.currency}
              onPurchase={handlePurchase}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;