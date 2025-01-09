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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  initialData?: any;
};

export function TestModuleDialog({
  open,
  onOpenChange,
  subjects,
  testTypes,
  onSuccess,
  initialData,
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
      if (initialData) {
        // Update test module
        const { error: moduleError } = await supabase
          .from("test_modules")
          .update({
            name: data.name,
            description: data.description,
            time_limit: data.time_limit,
            subject_id: data.subject_id,
            test_type_id: data.test_type_id,
          })
          .eq("id", initialData.id);

        if (moduleError) throw moduleError;

        // Delete existing topic percentages
        const { error: deleteError } = await supabase
          .from("module_topics")
          .delete()
          .eq("module_id", initialData.id);

        if (deleteError) throw deleteError;
      } else {
        // Insert new test module
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
        initialData = moduleData;
      }

      // Insert topic percentages
      const topicPercentages = Object.entries(data.topic_percentages).map(([topicId, percentage]) => ({
        module_id: initialData.id,
        topic_id: topicId,
        percentage: percentage,
      }));

      const { error: topicError } = await supabase
        .from("module_topics")
        .insert(topicPercentages);

      if (topicError) throw topicError;

      toast({
        title: `Test module ${initialData ? 'updated' : 'created'} successfully`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Error ${initialData ? 'updating' : 'creating'} test module`,
        description: error.message,
      });
    }
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        time_limit: initialData.time_limit,
        subject_id: initialData.subject_id,
        test_type_id: initialData.test_type_id,
        topic_percentages: Object.fromEntries(
          initialData.module_topics?.map((topic: any) => [
            topic.topic_id,
            topic.percentage,
          ]) || []
        ),
      });
    }
  }, [initialData, form]);

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[85vh]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit' : 'Create New'} Test Module
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(85vh-120px)]">
            <div className="pr-4">
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
                    {initialData ? 'Update' : 'Create'} Module
                  </Button>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}