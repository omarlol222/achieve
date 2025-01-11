import { useState } from "react";
import { UseFormReturn, Path, PathValue } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Image, X } from "lucide-react";

type ImageUploadFieldProps<T extends Record<string, any>> = {
  form: UseFormReturn<T>;
  fieldName: Path<T>;
  label: string;
  multiple?: boolean;
};

export function ImageUploadField<T extends Record<string, any>>({
  form,
  fieldName,
  label,
  multiple = false,
}: ImageUploadFieldProps<T>) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("question_images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from("question_images")
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl.publicUrl);
      }

      if (multiple) {
        // Get current URLs (if any) and combine with new ones
        const currentUrls = form.getValues(fieldName) || [];
        const newUrls = Array.isArray(currentUrls) 
          ? [...currentUrls, ...uploadedUrls]
          : uploadedUrls;
        
        form.setValue(fieldName, newUrls as PathValue<T, Path<T>>, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        form.setValue(fieldName, uploadedUrls[0] as PathValue<T, Path<T>>, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } catch (error: any) {
      console.error("Error uploading image:", error.message);
    } finally {
      setIsUploading(false);
      // Reset the input value to allow uploading the same file again
      const input = document.getElementById(fieldName) as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  const removeImage = (urlToRemove: string) => {
    if (multiple) {
      const currentUrls = (form.getValues(fieldName) as string[]) || [];
      const updatedUrls = currentUrls.filter(url => url !== urlToRemove);
      form.setValue(fieldName, updatedUrls as PathValue<T, Path<T>>, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      form.setValue(fieldName, "" as PathValue<T, Path<T>>, {
        shouldValidate: true,
        shouldDirty: true,
      });
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
              multiple={multiple}
              className="hidden"
              onChange={handleImageUpload}
            />
            <div className="grid grid-cols-2 gap-4">
              {multiple ? (
                ((field.value || []) as string[]).map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Uploaded ${index + 1}`}
                      className="max-w-full h-auto rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage(url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                field.value && (
                  <div className="relative">
                    <img
                      src={field.value}
                      alt="Uploaded"
                      className="max-w-full h-auto rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage(field.value)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}