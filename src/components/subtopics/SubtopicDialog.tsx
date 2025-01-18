import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubtopicFormFields } from "./fields/SubtopicFormFields";

type SubtopicFormData = {
  name: string;
  description?: string;
  topic_id: string;
};

type SubtopicDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSuccess: () => void;
  topics: any[];
};

export function SubtopicDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
  topics,
}: SubtopicDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<SubtopicFormData>({
    defaultValues: initialData || {
      name: "",
      description: "",
      topic_id: "",
    },
  });

  const onSubmit = async (data: SubtopicFormData) => {
    try {
      setIsSubmitting(true);

      if (initialData?.id) {
        const { error } = await supabase
          .from("subtopics")
          .update(data)
          .eq("id", initialData.id);
        if (error) throw error;
        toast({
          title: "Subtopic updated successfully",
        });
      } else {
        const { error } = await supabase.from("subtopics").insert(data);
        if (error) throw error;
        toast({
          title: "Subtopic created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["subtopics"] });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Subtopic" : "Add New Subtopic"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <SubtopicFormFields form={form} topics={topics} />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                  ? "Update Subtopic"
                  : "Add Subtopic"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}