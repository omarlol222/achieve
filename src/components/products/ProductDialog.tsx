import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ImageUploadField } from "@/components/questions/fields/ImageUploadField";
import { TestTypePermissions } from "./TestTypePermissions";

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  permissions: {
    test_type_id: string;
    has_course: boolean;
    has_simulator: boolean;
  }[];
};

export function ProductDialog({ 
  open, 
  onClose,
  product 
}: { 
  open: boolean;
  onClose: () => void;
  product?: any;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      currency: "SAR",
      image_url: "",
      permissions: [],
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        image_url: product.image_url,
        permissions: product.permissions?.map((p: any) => ({
          test_type_id: p.test_type.id,
          has_course: p.has_course,
          has_simulator: p.has_simulator,
        })) || [],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        currency: "SAR",
        image_url: "",
        permissions: [],
      });
    }
  }, [product, form]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (product) {
        // Update existing product
        const { error: productError } = await supabase
          .from("products")
          .update({
            name: data.name,
            description: data.description,
            price: data.price,
            currency: data.currency,
            image_url: data.image_url,
          })
          .eq("id", product.id);

        if (productError) throw productError;

        // Delete existing permissions
        const { error: deleteError } = await supabase
          .from("product_permissions")
          .delete()
          .eq("product_id", product.id);

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
            image_url: data.image_url,
          })
          .select()
          .single();

        if (productError) throw productError;

        product = newProduct;
      }

      // Insert permissions
      if (data.permissions.length > 0) {
        const { error: permissionsError } = await supabase
          .from("product_permissions")
          .insert(
            data.permissions.map((permission) => ({
              product_id: product.id,
              test_type_id: permission.test_type_id,
              has_course: permission.has_course,
              has_simulator: permission.has_simulator,
            }))
          );

        if (permissionsError) throw permissionsError;
      }

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast({ title: `Product ${product ? "updated" : "created"} successfully` });
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving product",
        description: error.message,
      });
    }
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <ImageUploadField
              form={form}
              fieldName="image_url"
              label="Product Image"
            />

            <TestTypePermissions form={form} />

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