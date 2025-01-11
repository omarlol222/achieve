import { useState } from "react";
import { UseFormReturn, Path } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Image } from "lucide-react";

type ImageUploadFieldProps<T extends Record<string, any>> = {
  form: UseFormReturn<T>;
  fieldName: Path<T>;
  label: string;
};

export function ImageUploadField<T extends Record<string, any>>({
  form,
  fieldName,
  label,
}: ImageUploadFieldProps<T>) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("question_images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("question_images")
        .getPublicUrl(filePath);

      form.setValue(fieldName, publicUrl.publicUrl);
    } catch (error: any) {
      console.error("Error uploading image:", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isUploading}
              onClick={() => document.getElementById(fieldName)?.click()}
            >
              <Image className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
            <input
              id={fieldName}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            {field.value && (
              <img
                src={field.value}
                alt="Uploaded"
                className="max-w-full h-auto rounded-md"
              />
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}