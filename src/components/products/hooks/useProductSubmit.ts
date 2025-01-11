import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProductFormData } from "../types";

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
          })
          .eq("id", productId);

        if (productError) throw productError;

        // Update product media entries for detail images
        if (data.detail_images.length > 0) {
          // Delete existing media
          const { error: deleteMediaError } = await supabase
            .from("product_media")
            .delete()
            .eq("product_id", productId);

          if (deleteMediaError) throw deleteMediaError;

          // Insert new media entries
          const { error: mediaError } = await supabase
            .from("product_media")
            .insert(
              data.detail_images.map((url) => ({
                product_id: productId,
                media_url: url,
                media_type: 'image'
              }))
            );

          if (mediaError) throw mediaError;
        }

        // Delete existing permissions
        const { error: deleteError } = await supabase
          .from("product_permissions")
          .delete()
          .eq("product_id", productId);

        if (deleteError) throw deleteError;
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
          })
          .select()
          .single();

        if (productError) throw productError;

        // Insert media entries for detail images
        if (data.detail_images.length > 0) {
          const { error: mediaError } = await supabase
            .from("product_media")
            .insert(
              data.detail_images.map((url) => ({
                product_id: newProduct.id,
                media_url: url,
                media_type: 'image'
              }))
            );

          if (mediaError) throw mediaError;
        }

        productId = newProduct.id;
      }

      // Insert permissions
      if (data.permissions.length > 0) {
        const { error: permissionsError } = await supabase
          .from("product_permissions")
          .insert(
            data.permissions.map((permission) => ({
              product_id: productId,
              test_type_id: permission.test_type_id,
              has_course: permission.has_course,
              has_simulator: permission.has_simulator,
            }))
          );

        if (permissionsError) throw permissionsError;
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