
import { supabase } from "@/integrations/supabase/client";
import { TestModuleFormData } from "../types";

export async function createTestModule(data: TestModuleFormData) {
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
  return moduleData;
}

export async function updateTestModule(id: string, data: TestModuleFormData) {
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
    .eq("id", id);

  if (moduleError) throw moduleError;
  return id;
}

export async function deleteModuleTopics(moduleId: string) {
  const { error } = await supabase
    .from("module_topics")
    .delete()
    .eq("module_id", moduleId);

  if (error) throw error;
}

export async function createModuleTopics(moduleId: string, data: TestModuleFormData) {
  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("id")
    .eq("subject_id", data.subject_id);

  if (topicsError) throw topicsError;

  const totalPercentage = topics.reduce((sum, topic) => 
    sum + (data.topic_percentages[topic.id] || 0), 0);

  const topicData = topics.map(topic => {
    const percentage = totalPercentage === 0 
      ? 100 / topics.length
      : (data.topic_percentages[topic.id] || 0);
    
    const questionCount = Math.round((percentage / (totalPercentage || 100)) * data.total_questions);
    
    return {
      module_id: moduleId,
      topic_id: topic.id,
      percentage: percentage,
      question_count: questionCount
    };
  });

  let currentSum = topicData.reduce((sum, topic) => sum + topic.question_count, 0);
  if (currentSum !== data.total_questions) {
    const diff = data.total_questions - currentSum;
    const maxPercentageTopic = topicData.reduce((max, topic) => 
      topic.percentage > max.percentage ? topic : max, topicData[0]);
    maxPercentageTopic.question_count += diff;
  }

  const { error: topicError } = await supabase
    .from("module_topics")
    .insert(topicData);

  if (topicError) throw topicError;
  return topicData;
}
