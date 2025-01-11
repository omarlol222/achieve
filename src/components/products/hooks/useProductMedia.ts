import { supabase } from "@/integrations/supabase/client";

export async function updateProductMedia(productId: string, detailImages: string[]) {
  if (detailImages.length > 0) {
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
        detailImages.map((url) => ({
          product_id: productId,
          media_url: url,
          media_type: 'image'
        }))
      );

    if (mediaError) throw mediaError;
  }
}

export async function createProductMedia(productId: string, detailImages: string[]) {
  if (detailImages.length > 0) {
    const { error: mediaError } = await supabase
      .from("product_media")
      .insert(
        detailImages.map((url) => ({
          product_id: productId,
          media_url: url,
          media_type: 'image'
        }))
      );

    if (mediaError) throw mediaError;
  }
}