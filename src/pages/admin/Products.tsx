import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductDialog } from "@/components/products/ProductDialog";
import { ProductList } from "@/components/products/ProductList";

const Products = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          media:product_media(media_url, media_type),
          permissions:product_permissions(
            has_course,
            has_simulator,
            test_type:test_types(id, name)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <ProductList products={products} onEdit={handleEdit} />

      <ProductDialog
        open={isDialogOpen}
        onClose={handleClose}
        product={selectedProduct}
      />
    </div>
  );
};

export default Products;