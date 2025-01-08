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
import { TopicFormFields } from "./fields/TopicFormFields";

type TopicFormData = {
  name: string;
  description?: string;
  subject_id: string;
  test_type_id: string;
};

type TopicDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSuccess: () => void;
  subjects: any[];
  testTypes: any[];
};

export function TopicDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
  subjects,
  testTypes,
}: TopicDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<TopicFormData>({
    defaultValues: initialData || {
      name: "",
      description: "",
      subject_id: "",
      test_type_id: "",
    },
  });

  const onSubmit = async (data: TopicFormData) => {
    try {
      setIsSubmitting(true);

      if (initialData?.id) {
        const { error } = await supabase
          .from("topics")
          .update(data)
          .eq("id", initialData.id);
        if (error) throw error;
        toast({
          title: "Topic updated successfully",
        });
      } else {
        const { error } = await supabase.from("topics").insert(data);
        if (error) throw error;
        toast({
          title: "Topic created successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["topics"] });
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
            {initialData ? "Edit Topic" : "Add New Topic"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TopicFormFields
              form={form}
              subjects={subjects}
              testTypes={testTypes}
            />

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
                  ? "Update Topic"
                  : "Add Topic"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}