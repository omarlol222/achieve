import { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/questions/fields/ImageUploadField";
import { TestTypePermissions } from "../TestTypePermissions";
import { ProductFormData } from "../types";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export function ProductFormFields({ 
  form 
}: { 
  form: UseFormReturn<ProductFormData> 
}) {
  const { data: testTypes } = useQuery({
    queryKey: ["test-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_types")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const customFeatures = form.watch("custom_features") || [];

  const addCustomFeature = () => {
    form.setValue("custom_features", [...customFeatures, ""]);
  };

  const removeCustomFeature = (index: number) => {
    const newFeatures = customFeatures.filter((_, i) => i !== index);
    form.setValue("custom_features", newFeatures);
  };

  return (
    <div className="space-y-6">
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

      <FormField
        control={form.control}
        name="test_type_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Test Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {testTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <ImageUploadField
        form={form}
        fieldName="thumbnail_url"
        label="Shop Thumbnail Image"
        multiple={false}
      />

      <ImageUploadField
        form={form}
        fieldName="detail_images"
        label="Product Detail Images"
        multiple={true}
      />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <FormLabel>Custom Features</FormLabel>
          <Button type="button" variant="outline" size="sm" onClick={addCustomFeature}>
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>
        
        {customFeatures.map((_, index) => (
          <div key={index} className="flex gap-2">
            <FormField
              control={form.control}
              name={`custom_features.${index}`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input {...field} placeholder="Enter feature text" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={() => removeCustomFeature(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <TestTypePermissions form={form} />
    </div>
  );
}