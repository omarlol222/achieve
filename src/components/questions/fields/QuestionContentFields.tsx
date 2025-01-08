import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { QuestionFormData } from "@/types/question";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type QuestionContentFieldsProps = {
  form: UseFormReturn<QuestionFormData>;
};

export function QuestionContentFields({ form }: QuestionContentFieldsProps) {
  const questionType = form.watch("question_type");
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingExplanation, setIsUploadingExplanation] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: "image_url" | "explanation_image_url") => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isUploading = field === "image_url" ? setIsUploading : setIsUploadingExplanation;
    isUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('question_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('question_images')
        .getPublicUrl(filePath);

      form.setValue(field, publicUrl);
      toast({
        title: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error uploading image",
        description: error.message,
      });
    } finally {
      isUploading(false);
    }
  };

  return (
    <>
      {questionType === "passage" && (
        <FormField
          control={form.control}
          name="passage_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passage Text</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="question_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Question Text</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {questionType === "normal" && (
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Image (Optional)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "image_url")}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                  {field.value && (
                    <div className="mt-2">
                      <img src={field.value} alt="Question" className="max-w-xs rounded-md" />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {["choice1", "choice2", "choice3", "choice4"].map((choiceName) => (
        <FormField
          key={choiceName}
          control={form.control}
          name={choiceName as keyof QuestionFormData}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choice {choiceName.slice(-1)}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </>
  );
}