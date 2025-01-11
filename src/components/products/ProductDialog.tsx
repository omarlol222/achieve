import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ProductFormFields } from "./fields/ProductFormFields";
import { useProductSubmit } from "./hooks/useProductSubmit";
import { ProductFormData } from "./types";

export function ProductDialog({ 
  open, 
  onClose,
  product 
}: { 
  open: boolean;
  onClose: () => void;
  product?: any;
}) {
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      currency: "SAR",
      thumbnail_url: "",
      detail_images: [],
      test_type_id: "",
      permissions: [],
    },
  });

  const { handleSubmit } = useProductSubmit(onClose);

  useEffect(() => {
    if (product) {
      // Get detail images from product_media
      const detailImages = product.media?.map((m: any) => m.media_url) || [];

      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        thumbnail_url: product.image_url || "",
        detail_images: detailImages,
        test_type_id: product.test_type_id || "",
        permissions: product.permissions?.map((p: any) => ({
          test_type_id: p.test_type.id,
          has_course: p.has_course,
          has_simulator: p.has_simulator,
          has_practice: p.has_practice,
          course_text: p.course_text || `Access to ${p.test_type.name} Course`,
          simulator_text: p.simulator_text || `Access to ${p.test_type.name} Simulator`,
          practice_text: p.practice_text || `Access to ${p.test_type.name} Practice`,
        })) || [],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        currency: "SAR",
        thumbnail_url: "",
        detail_images: [],
        test_type_id: "",
        permissions: [],
      });
    }
  }, [product, form]);

  const onSubmit = (data: ProductFormData) => {
    handleSubmit(data, product?.id);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Create Product"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ProductFormFields form={form} />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {product ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}