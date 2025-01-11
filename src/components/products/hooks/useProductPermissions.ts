import { supabase } from "@/integrations/supabase/client";
import { ProductFormData } from "../types";

export async function updateProductPermissions(productId: string, permissions: ProductFormData['permissions']) {
  // Delete existing permissions
  const { error: deleteError } = await supabase
    .from("product_permissions")
    .delete()
    .eq("product_id", productId);

  if (deleteError) throw deleteError;

  // Insert new permissions if any
  if (permissions.length > 0) {
    const { error: permissionsError } = await supabase
      .from("product_permissions")
      .insert(
        permissions.map((permission) => ({
          product_id: productId,
          test_type_id: permission.test_type_id,
          has_course: permission.has_course,
          has_simulator: permission.has_simulator,
          has_practice: permission.has_practice,
        }))
      );

    if (permissionsError) throw permissionsError;
  }
}

export async function createProductPermissions(productId: string, permissions: ProductFormData['permissions']) {
  if (permissions.length > 0) {
    const { error: permissionsError } = await supabase
      .from("product_permissions")
      .insert(
        permissions.map((permission) => ({
          product_id: productId,
          test_type_id: permission.test_type_id,
          has_course: permission.has_course,
          has_simulator: permission.has_simulator,
          has_practice: permission.has_practice,
        }))
      );

    if (permissionsError) throw permissionsError;
  }
}