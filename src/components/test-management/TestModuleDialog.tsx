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
      total_questions: initialData?.total_questions || 1,
      difficulty_levels: ["Easy", "Moderate", "Hard"],
      order_index: 0,
    },
  });

  const onSubmit = async (data: TestModuleFormData) => {
    try {
      console.log("Submitting form data:", data);
      let moduleId;
      
      // Ensure total_questions is a number
      const totalQuestions = Number(data.total_questions) || 1;
      console.log("Total questions:", totalQuestions);

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

      // Get all topics for the selected subject
      const { data: topics, error: topicsError } = await supabase
        .from("topics")
        .select("id")
        .eq("subject_id", data.subject_id);

      if (topicsError) throw topicsError;
      
      // Calculate total percentage
      const totalPercentage = topics.reduce((sum, topic) => 
        sum + (data.topic_percentages[topic.id] || 0), 0);

      // Prepare topic data
      const topicData = topics.map(topic => {
        const percentage = totalPercentage === 0 
          ? 100 / topics.length  // Equal distribution if no percentages
          : (data.topic_percentages[topic.id] || 0);
        
        const questionCount = Math.max(1, Math.round((percentage / (totalPercentage || 100)) * totalQuestions));
        
        return {
          module_id: moduleId,
          topic_id: topic.id,
          percentage: percentage,
          question_count: questionCount
        };
      });

      console.log("Topic data for insertion:", topicData);

      // Insert all topic percentages
      const { error: topicError } = await supabase
        .from("module_topics")
        .insert(topicData);

      if (topicError) {
        console.error("Error inserting topic data:", topicError);
        throw topicError;
      }
      console.log("Successfully inserted topic data");

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
      
      // Fetch module topics for the initial data
      const fetchModuleTopics = async () => {
        const { data: moduleTopics, error } = await supabase
          .from("module_topics")
          .select("*")
          .eq("module_id", initialData.id);
          
        if (error) {
          console.error("Error fetching module topics:", error);
          return;
        }
        
        console.log("Fetched module topics:", moduleTopics);
        
        // Convert module_topics array to topic_percentages object
        const topicPercentages = {};
        moduleTopics?.forEach((topic) => {
          topicPercentages[topic.topic_id] = Number(topic.percentage);
        });

        // Calculate total questions from the moduleTopics
        const totalQuestions = moduleTopics?.reduce(
          (sum, topic) => sum + (topic.question_count || 0),
          0
        ) || 1;

        console.log("Setting total questions to:", totalQuestions);

        form.reset({
          name: initialData.name || "",
          description: initialData.description || "",
          time_limit: initialData.time_limit || 0,
          subject_id: initialData.subject_id || "",
          test_type_id: initialData.test_type_id || "",
          topic_percentages: topicPercentages,
          total_questions: totalQuestions,
          difficulty_levels: initialData.difficulty_levels || ["Easy", "Moderate", "Hard"],
          order_index: initialData.order_index || 0,
        });
      };

      fetchModuleTopics();
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
