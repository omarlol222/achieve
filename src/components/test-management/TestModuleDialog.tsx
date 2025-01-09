import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BasicFields } from "./form-fields/BasicFields";
import { SelectFields } from "./form-fields/SelectFields";
import { TopicPercentageFields } from "./TopicPercentageFields";
import { TestModuleFormData } from "./types";

type TestModuleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: any[];
  testTemplates: any[];
  testTypes: any[];
  onSuccess: () => void;
};

export function TestModuleDialog({
  open,
  onOpenChange,
  subjects,
  testTypes,
  onSuccess,
}: TestModuleDialogProps) {
  const { toast } = useToast();
  const form = useForm<TestModuleFormData>({
    defaultValues: {
      name: "",
      description: "",
      time_limit: 0,
      subject_id: "",
      test_type_id: "",
      topic_percentages: {},
    },
  });

  const onSubmit = async (data: TestModuleFormData) => {
    try {
      // Insert test module
      const { data: moduleData, error: moduleError } = await supabase
        .from("test_modules")
        .insert([{
          name: data.name,
          description: data.description,
          time_limit: data.time_limit,
          subject_id: data.subject_id,
          test_type_id: data.test_type_id,
        }])
        .select()
        .single();

      if (moduleError) throw moduleError;

      // Insert topic percentages
      const topicPercentages = Object.entries(data.topic_percentages).map(([topicId, percentage]) => ({
        module_id: moduleData.id,
        topic_id: topicId,
        percentage: percentage,
      }));

      const { error: topicError } = await supabase
        .from("module_topics")
        .insert(topicPercentages);

      if (topicError) throw topicError;

      toast({
        title: "Test module created successfully",
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating test module",
        description: error.message,
      });
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Test Module</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicFields form={form} />
            <SelectFields 
              form={form} 
              subjects={subjects} 
              testTypes={testTypes} 
            />
            <TopicPercentageFields 
              form={form}
              subjectId={form.watch("subject_id")}
            />
            <Button type="submit" className="w-full">
              Create Module
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}