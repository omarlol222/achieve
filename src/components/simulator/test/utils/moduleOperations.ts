
import { supabase } from "@/integrations/supabase/client";

export async function getModuleByIndex(currentModuleIndex: number) {
  console.log("Getting module at index:", currentModuleIndex);
  
  const { data: modules, error: modulesError } = await supabase
    .from("test_modules")
    .select(`
      id,
      name,
      subject_id,
      test_type_id,
      time_limit,
      description,
      subject:subjects (
        id,
        name
      ),
      module_topics (
        id,
        topic_id,
        percentage,
        question_count,
        topic:topics (
          id,
          name,
          subject_id
        )
      )
    `)
    .order("order_index", { ascending: true });

  if (modulesError) {
    console.error("Error loading modules:", modulesError);
    throw new Error("Failed to load test modules");
  }

  if (!modules || modules.length === 0) {
    throw new Error("No test modules available");
  }

  const currentModule = modules[currentModuleIndex];
  if (!currentModule) {
    throw new Error(`No module found at position ${currentModuleIndex + 1}`);
  }

  console.log("Selected module with topics:", {
    id: currentModule.id,
    name: currentModule.name,
    subjectId: currentModule.subject_id,
    testTypeId: currentModule.test_type_id,
    topics: currentModule.module_topics
  });

  return {
    ...currentModule,
    total_questions: currentModule.module_topics?.reduce(
      (sum, topic) => sum + (topic.question_count || 0), 
      0
    ) || 0
  };
}
