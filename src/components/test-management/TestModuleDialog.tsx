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
import { DifficultyLevelsField } from "./form-fields/DifficultyLevelsField";
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
      total_questions: 1,
      difficulty_levels: ["Easy", "Moderate", "Hard"],
      order_index: 0,
    },
  });

  const onSubmit = async (data: TestModuleFormData) => {
    try {
      console.log("Submitting form data:", data);
      let moduleId;
      
      if (initialData) {
        console.log("Updating existing module:", initialData.id);
        // Update test module
        const { error: moduleError } = await supabase
          .from("test_modules")
          .update({
            name: data.name,
            description: data.description,
            time_limit: data.time_limit,
            subject_id: data.subject_id,
            test_type_id: data.test_type_id,
            difficulty_levels: data.difficulty_levels,
            order_index: data.order_index,
          })
          .eq("id", initialData.id);

        if (moduleError) throw moduleError;
        moduleId = initialData.id;

        console.log("Deleting existing topic percentages for module:", moduleId);
        // Delete existing topic percentages
        const { error: deleteError } = await supabase
          .from("module_topics")
          .delete()
          .eq("module_id", moduleId);

        if (deleteError) throw deleteError;
      } else {
        console.log("Creating new module");
        // Insert new test module
        const { data: moduleData, error: moduleError } = await supabase
          .from("test_modules")
          .insert([{
            name: data.name,
            description: data.description,
            time_limit: data.time_limit,
            subject_id: data.subject_id,
            test_type_id: data.test_type_id,
            difficulty_levels: data.difficulty_levels,
            order_index: data.order_index,
          }])
          .select()
          .single();

        if (moduleError) throw moduleError;
        moduleId = moduleData.id;
        console.log("Created new module with ID:", moduleId);
      }

      // Calculate question count per topic based on percentages and insert topic percentages
      const totalQuestions = data.total_questions;
      console.log("Processing topic percentages. Total questions:", totalQuestions);
      console.log("Topic percentages data:", data.topic_percentages);
      
      // Filter topics with non-zero percentages
      const nonZeroTopics = Object.entries(data.topic_percentages)
        .filter(([_, percentage]) => percentage > 0);

      // First pass: Calculate initial question counts
      const topicData = nonZeroTopics.map(([topicId, percentage]) => {
        // Ensure at least 1 question per topic with non-zero percentage
        const rawQuestionCount = Math.max(1, Math.round((percentage / 100) * totalQuestions));
        console.log(`Topic ${topicId}: ${percentage}% = ${rawQuestionCount} questions`);
        return {
          module_id: moduleId,
          topic_id: topicId,
          percentage: percentage,
          question_count: rawQuestionCount,
        };
      });

      console.log("Prepared topic data for insertion:", topicData);

      if (topicData.length > 0) {
        const { error: topicError } = await supabase
          .from("module_topics")
          .insert(topicData);

        if (topicError) {
          console.error("Error inserting topic data:", topicError);
          throw topicError;
        }
        console.log("Successfully inserted topic data");
      }

      toast({
        title: `Test module ${initialData ? 'updated' : 'created'} successfully`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast({
        variant: "destructive",
        title: `Error ${initialData ? 'updating' : 'creating'} test module`,
        description: error.message,
      });
    }
  };

  useEffect(() => {
    if (initialData) {
      console.log("Setting form data from initialData:", initialData);
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
        total_questions: initialData.module_topics?.reduce(
          (sum: number, topic: any) => sum + topic.question_count,
          0
        ) || 1,
        difficulty_levels: initialData.difficulty_levels || ["Easy", "Moderate", "Hard"],
        order_index: initialData.order_index || 0,
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
                  <DifficultyLevelsField form={form} />
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