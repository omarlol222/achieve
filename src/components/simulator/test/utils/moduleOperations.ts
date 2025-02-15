
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
      subject:subjects (
        id,
        name
      ),
      module_topics:module_topics (
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

  // Validate that module topics belong to the correct subject
  const invalidTopics = currentModule.module_topics?.filter(
    mt => mt.topic?.subject_id !== currentModule.subject_id
  );

  if (invalidTopics && invalidTopics.length > 0) {
    console.error("Module contains topics from wrong subject:", {
      moduleSubject: currentModule.subject_id,
      invalidTopics: invalidTopics.map(t => ({
        topicId: t.topic_id,
        subjectId: t.topic?.subject_id
      }))
    });
    throw new Error("Module contains topics from incorrect subject");
  }

  console.log("Selected module:", {
    id: currentModule.id,
    name: currentModule.name,
    subjectId: currentModule.subject_id,
    testTypeId: currentModule.test_type_id,
    topicsCount: currentModule.module_topics?.length
  });

  // Calculate total questions from module_topics
  const totalQuestions = currentModule.module_topics?.reduce(
    (sum, topic) => sum + topic.question_count,
    0
  ) || 0;

  return {
    ...currentModule,
    total_questions: totalQuestions
  };
}
