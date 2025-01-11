import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProductFormData } from "../types";
import { updateProductPermissions, createProductPermissions } from "./useProductPermissions";
import { updateProductMedia, createProductMedia } from "./useProductMedia";

export function useProductSubmit(onClose: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: ProductFormData, productId?: string) => {
    try {
      if (productId) {
        // Update existing product
        const { error: productError } = await supabase
          .from("products")
          .update({
            name: data.name,
            description: data.description,
            price: data.price,
            currency: data.currency,
            image_url: data.thumbnail_url,
            test_type_id: data.test_type_id,
            custom_features: data.custom_features, // Add this line to include custom_features in update
          })
          .eq("id", productId);

        if (productError) throw productError;

        // Update product media and permissions
        await updateProductMedia(productId, data.detail_images);
        await updateProductPermissions(productId, data.permissions);
      } else {
        // Insert new product
        const { data: newProduct, error: productError } = await supabase
          .from("products")
          .insert({
            name: data.name,
            description: data.description,
            price: data.price,
            currency: data.currency,
            image_url: data.thumbnail_url,
            test_type_id: data.test_type_id,
            custom_features: data.custom_features,
          })
          .select()
          .single();

        if (productError) throw productError;

        // Create product media and permissions
        await createProductMedia(newProduct.id, data.detail_images);
        await createProductPermissions(newProduct.id, data.permissions);
      }

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: `Product ${productId ? "updated" : "created"} successfully` });
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving product",
        description: error.message,
      });
    }
  };

  return { handleSubmit };
}