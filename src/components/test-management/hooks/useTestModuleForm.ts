
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TestModuleFormData } from "../types";

export function useTestModuleForm(initialData: any) {
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

  useEffect(() => {
    if (initialData) {
      console.log("Setting form data from initialData:", initialData);
      
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
        
        const topicPercentages = {};
        moduleTopics?.forEach((topic) => {
          topicPercentages[topic.topic_id] = Number(topic.percentage);
        });

        const totalQuestions = moduleTopics?.reduce((sum, topic) => 
          sum + topic.question_count, 0) || 1;

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

  return form;
}
